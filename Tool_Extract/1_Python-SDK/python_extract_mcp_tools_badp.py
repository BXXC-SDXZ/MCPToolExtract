import os
import json
import csv
import ast
import re
import textwrap
import heapq
from pathlib import Path

# Configuration
INPUT_CSV = "../0_SDK-classify/mcp_analysis_results.csv"
OUTPUT_JSON = "mcp_tools_full.json"
OUTPUT_CSV = "python_mcp_tools.csv"  # Added CSV output
ROOT_DIR = "/mnt/maldetect_NAS/MCP/MCP_env1/shandong_MCP/mcp_raw_dataset"

# --- BADP Parameters ---
SOFT_LIMIT_DEPS = 15      # Pause recursion for new branches
HARD_LIMIT_DEPS = 20      # Absolute max dependencies (Circuit Breaker)
HARD_LIMIT_CHARS = 30000  # Max bundle size (Circuit Breaker)
HUGE_CONSTANT_THRESHOLD = 500 # Chars threshold to truncate constants

class CircuitBreakerTriggered(Exception):
    """Raised when hard limits are exceeded."""
    pass

def get_server_description(project_path):
    path = Path(project_path)
    description = None
    readme_path = None
    for f in path.glob("README*"):
        readme_path = f
        break
    if readme_path:
        try:
            content = readme_path.read_text(encoding='utf-8', errors='ignore')
            lines = content.splitlines()
            for i, line in enumerate(lines):
                if line.strip().startswith("# ") and i + 1 < len(lines):
                     for j in range(i + 1, len(lines)):
                         if lines[j].strip():
                             description = lines[j].strip()
                             break
                     if description: break
        except: pass
    if not description and (path / "pyproject.toml").exists():
        try:
            content = (path / "pyproject.toml").read_text(encoding='utf-8', errors='ignore')
            match = re.search(r'description\s*=\s*"(.*)"', content)
            if match: description = match.group(1)
        except: pass
    return description

class ConstantTruncator(ast.NodeTransformer):
    """
    AST-level Denoising: Truncates large constants (lists, dicts, strings)
    to reduce token usage while preserving structure.
    """
    def visit_Constant(self, node):
        # Python 3.8+ for literals
        if isinstance(node.value, str) and len(node.value) > HUGE_CONSTANT_THRESHOLD:
            return ast.Constant(value=f"{node.value[:100]}... [TRUNCATED {len(node.value)} chars]")
        return node
        
    def visit_List(self, node):
        # Transform large lists into truncated versions
        if len(node.elts) > 20: # Heuristic threshold
             # Keep first 5 and add a comment-like string
             new_elts = node.elts[:5]
             # We can't easily insert a comment in AST, but we can append a string constant
             new_elts.append(ast.Constant(value=f"... [TRUNCATED {len(node.elts)-5} items]"))
             return ast.List(elts=new_elts, ctx=node.ctx)
        return self.generic_visit(node)

def clean_source_code(node):
    """
    Applies AST transformations to clean the code (Denoising).
    Returns the cleaned source string.
    """
    try:
        # We need a deep copy or re-parse because we are modifying the AST
        # Since we only have the node, let's unparse it first if python version supports it,
        # or just work on the node if it's isolated.
        # Note: ast.unparse is Python 3.9+. Assuming environment supports it.
        # If not, we might fall back to original source, but Denoising is a key requirement.
        
        # To be safe and compatible, we'll try to use the original source segment 
        # and re-parse it into a temporary tree for transformation.
        # But we already have the node from the file's tree.
        # Modifying 'node' in place is risky if it's part of a cached global index.
        # So we won't modify the global index nodes. We'll handle this at bundle creation time.
        pass
    except:
        pass
    return None 

def build_global_index(project_path):
    global_defs = {}
    path = Path(project_path)
    for file_path in path.rglob("*.py"):
        if any(x in str(file_path) for x in ["venv", ".venv", "site-packages", "tests", "__pycache__"]):
            continue
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                source = f.read()
                tree = ast.parse(source)
            relative_path = file_path.relative_to(path)
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    # Store the node directly, we will extract source on demand to allow cleaning
                    global_defs[node.name] = {
                        "node": node,
                        "file_path": file_path, # Absolute path for reading if needed
                        "file_rel": str(relative_path),
                        "source_segment": ast.get_source_segment(source, node)
                    }
        except: pass
    return global_defs

def get_node_source_denoised(node_info):
    """
    Retrieves source code for a node and applies AST denoising (Constant Truncation).
    """
    try:
        # Re-parse the specific segment to isolate it for transformation
        if not node_info["source_segment"]: return ""
        
        local_tree = ast.parse(textwrap.dedent(node_info["source_segment"]))
        
        # Apply cleaning
        transformer = ConstantTruncator()
        cleaned_tree = transformer.visit(local_tree)
        ast.fix_missing_locations(cleaned_tree)
        
        # Unparse back to string (Python 3.9+)
        if hasattr(ast, "unparse"):
            return ast.unparse(cleaned_tree)
        else:
            # Fallback for older python: return original
            return textwrap.dedent(node_info["source_segment"])
            
    except Exception as e:
        # Fallback if parsing fails or unparse is not available
        return textwrap.dedent(node_info.get("source_segment", ""))

def extract_dependencies_priority(start_node, global_defs):
    """
    Priority Queue based BFS for dependency extraction.
    Prioritizes direct calls (distance=1) over indirect calls.
    Implements Soft/Hard limits.
    """
    # Priority Queue: (distance, order_of_appearance, name)
    # We use order_of_appearance to keep stable sort for same distance
    queue = [] 
    
    visited = set()
    dependencies = []
    
    # Scan start_node for initial dependencies (Distance 1)
    counter = 0
    initial_deps = _scan_for_calls(start_node)
    for dep_name in initial_deps:
        if dep_name in global_defs:
            heapq.heappush(queue, (1, counter, dep_name))
            visited.add(dep_name)
            counter += 1

    while queue:
        dist, _, current_name = heapq.heappop(queue)
        
        # --- Circuit Breaker: Hard Limit ---
        if len(dependencies) >= HARD_LIMIT_DEPS:
             # Stop adding new dependencies.
             break 

        # --- Soft Limit Check ---
        if len(dependencies) >= SOFT_LIMIT_DEPS:
            # Add but don't scan
            node_info = global_defs[current_name]
            cleaned_source = get_node_source_denoised(node_info)
            dependencies.append({
                "name": current_name,
                "source": cleaned_source,
                "file": node_info["file_rel"]
            })
            continue # Skip scanning children

        # Process current node
        node_info = global_defs[current_name]
        cleaned_source = get_node_source_denoised(node_info)
        dependencies.append({
            "name": current_name,
            "source": cleaned_source,
            "file": node_info["file_rel"]
        })
        
        # Scan for children (Distance + 1)
        child_calls = _scan_for_calls(node_info["node"])
        for child_name in child_calls:
            if child_name in global_defs and child_name not in visited:
                heapq.heappush(queue, (dist + 1, counter, child_name))
                visited.add(child_name)
                counter += 1

    return dependencies

def _scan_for_calls(node):
    calls = []
    for child in ast.walk(node):
        if isinstance(child, ast.Call):
            if isinstance(child.func, ast.Name):
                calls.append(child.func.id)
    return calls

def create_xml_bundle(entry_point_source, dependencies):
    xml_parts = ["<tool_bundle>", "  <entry_point>"]
    xml_parts.append(textwrap.indent(entry_point_source, "    "))
    xml_parts.append("  </entry_point>")
    
    if dependencies:
        xml_parts.append("  <internal_dependencies>")
        for dep in dependencies:
            xml_parts.append(textwrap.indent(dep["source"], "    "))
        xml_parts.append("  </internal_dependencies>")
        
    xml_parts.append("</tool_bundle>")
    return "\n".join(xml_parts)

def extract_tools_from_file(file_path, global_defs, project_root):
    tools_data = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            source = f.read()
            tree = ast.parse(source)
        relative_path = str(Path(file_path).relative_to(project_root))

        for node in ast.walk(tree):
            tool_info = None
            
            # 1. Decorators
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                is_tool = False
                for decorator in node.decorator_list:
                    dec_name = ""
                    if isinstance(decorator, ast.Name): dec_name = decorator.id
                    elif isinstance(decorator, ast.Attribute): dec_name = decorator.attr
                    elif isinstance(decorator, ast.Call):
                        if isinstance(decorator.func, ast.Name): dec_name = decorator.func.id
                        elif isinstance(decorator.func, ast.Attribute): dec_name = decorator.func.attr
                    if dec_name == 'tool':
                        is_tool = True
                        break
                if is_tool:
                    tool_info = {"name": node.name, "description": ast.get_docstring(node), "node": node, "source_segment": ast.get_source_segment(source, node)}

            # 2. Tool(...) instantiation
            elif isinstance(node, ast.Call):
                func = node.func
                is_tool_class = False
                if isinstance(func, ast.Name) and func.id == 'Tool': is_tool_class = True
                elif isinstance(func, ast.Attribute) and func.attr == 'Tool': is_tool_class = True
                
                if is_tool_class:
                    tool_name = None
                    description = None
                    for keyword in node.keywords:
                        if keyword.arg == 'name':
                            if isinstance(keyword.value, ast.Constant): tool_name = keyword.value.value
                            elif isinstance(keyword.value, ast.Str): tool_name = keyword.value.s
                        elif keyword.arg == 'description':
                            if isinstance(keyword.value, ast.Constant): description = keyword.value.value
                            elif isinstance(keyword.value, ast.Str): description = keyword.value.s
                    if tool_name:
                         tool_info = {"name": tool_name, "description": description, "node": node, "source_segment": ast.get_source_segment(source, node)}

            # 3. Manual Registration
            elif isinstance(node, ast.Expr):
                if isinstance(node.value, ast.Call):
                    outer_call = node.value
                    if outer_call.args and isinstance(outer_call.args[0], ast.Name):
                         inner_func = outer_call.func
                         if isinstance(inner_func, ast.Call):
                             most_inner = inner_func.func
                             if isinstance(most_inner, ast.Attribute) and most_inner.attr == 'tool':
                                 func_name = outer_call.args[0].id
                                 func_def_node = None
                                 for sub in ast.walk(tree):
                                     if isinstance(sub, (ast.FunctionDef, ast.AsyncFunctionDef)) and sub.name == func_name:
                                         func_def_node = sub
                                         break
                                 if func_def_node:
                                     tool_info = {"name": func_name, "description": ast.get_docstring(func_def_node), "node": func_def_node, "source_segment": ast.get_source_segment(source, func_def_node)}
                                 else:
                                     tool_info = {"name": func_name, "description": None, "node": node, "source_segment": ast.get_source_segment(source, node)}

            if tool_info:
                # Denoise Entry Point
                entry_source = get_node_source_denoised(tool_info)
                
                # Priority Extraction
                dependencies = extract_dependencies_priority(tool_info["node"], global_defs)
                
                # Create Bundle
                bundle_content = create_xml_bundle(entry_source, dependencies)
                
                tools_data.append({
                    "tool_name": tool_info["name"],
                    "file_path": relative_path,
                    "description": tool_info["description"],
                    "bundle_content": bundle_content,
                    "bundle_char_count": len(bundle_content),
                    "internal_dependencies_count": len(dependencies),
                    "is_denoised": True
                })

    except Exception as e:
        pass
    return tools_data

def main():
    if not os.path.exists(INPUT_CSV): return
    
    # Read CSV to get target projects
    projects_to_analyze = []
    csv_rows = []
    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            csv_rows.append(row)
            if row['Classification'] == 'python-sdk':
                projects_to_analyze.append(row['Project Name'])
    
    print(f"Running BADP Extraction on {len(projects_to_analyze)} projects...")
    
    all_tools_output = []
    tool_counts = {} # Map project name to tool count
    
    for project_name in projects_to_analyze:
        project_path = os.path.join(ROOT_DIR, project_name)
        if not os.path.exists(project_path): continue
        print(f"Analyzing {project_name}...")
        
        global_defs = build_global_index(project_path)
        path_obj = Path(project_path)
        
        project_tool_list = []
        for file_path in path_obj.rglob("*.py"):
            if any(x in str(file_path) for x in ["venv", ".venv", "site-packages", "tests"]): continue
            file_tools = extract_tools_from_file(file_path, global_defs, path_obj)
            for t in file_tools:
                t["server_name"] = project_name
                project_tool_list.append(t)
        
        # Deduplicate tools by name within project
        unique_tools = {t['tool_name']: t for t in project_tool_list}
        all_tools_output.extend(unique_tools.values())
        tool_counts[project_name] = len(unique_tools)

    # 1. Output Full JSON
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(all_tools_output, f, indent=4, ensure_ascii=False)
    
    # 2. Output Statistics CSV
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        new_fieldnames = fieldnames + ['Tool Count']
        writer = csv.DictWriter(f, fieldnames=new_fieldnames)
        writer.writeheader()
        for row in csv_rows:
            if row['Project Name'] in tool_counts:
                row['Tool Count'] = tool_counts[row['Project Name']]
            else:
                row['Tool Count'] = 0 if row['Classification'] == 'python-sdk' else "N/A"
            writer.writerow(row)

    print(f"Done. Extracted {len(all_tools_output)} tools.")
    print(f"Full JSON written to {OUTPUT_JSON}")
    print(f"Stats CSV written to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
