import os
import json
import csv
import re
from pathlib import Path

# Configuration
ROOT_DIR = "/mnt/maldetect_NAS/MCP/MCP_env1/shandong_MCP/mcp_raw_dataset"
OUTPUT_FILE = "./mcp_analysis_results.csv"

def analyze_project(project_path):
    """
    Analyzes a single project directory to determine if it's an MCP server and which SDK it uses.
    Returns a tuple: (classification, reason)
    """
    path = Path(project_path)
    if not path.is_dir():
        return "Error", "Not a directory"

    # Indicators
    has_python_sdk = False
    has_ts_sdk = False
    python_reasons = []
    ts_reasons = []
    other_reasons = []

    # 1. Check TypeScript SDK
    package_json_path = path / "package.json"
    if package_json_path.exists():
        try:
            with open(package_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                deps = data.get('dependencies', {})
                dev_deps = data.get('devDependencies', {})
                all_deps = {**deps, **dev_deps}
                
                if "@modelcontextprotocol/sdk" in all_deps:
                    has_ts_sdk = True
                    ts_reasons.append("在 package.json 中发现 @modelcontextprotocol/sdk")
        except Exception:
            pass # Ignore malformed json

    # Scan TS/JS files for imports if package.json check failed or to confirm
    if not has_ts_sdk:
        for file in path.rglob("*.[tj]s"):
            if "node_modules" in str(file): continue
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                if '@modelcontextprotocol/sdk' in content:
                     has_ts_sdk = True
                     ts_reasons.append(f"在 {file.name} 中发现 @modelcontextprotocol/sdk 导入")
                     break
            except:
                pass

    # 2. Check Python SDK
    # Check pyproject.toml
    pyproject_path = path / "pyproject.toml"
    if pyproject_path.exists():
        try:
            content = pyproject_path.read_text(encoding='utf-8', errors='ignore')
            if 'mcp' in content and ('dependencies' in content or 'poetry' in content):
                 # Simple check, might flag false positives but "mcp" package is the key
                 # Looking for "mcp" in a dependency context is harder with just text search, 
                 # but usually 'mcp' or 'mcp[' is unique enough in deps.
                 # Let's look for explicitly "mcp" or "fastmcp"
                 if re.search(r'[\"\']mcp[<>=\[\]\"\']', content) or re.search(r'[\"\']fastmcp[<>=\[\]\"\']', content):
                     has_python_sdk = True
                     python_reasons.append("在 pyproject.toml 中发现 mcp/fastmcp 依赖")
        except:
            pass

    # Check requirements.txt
    req_path = path / "requirements.txt"
    if req_path.exists():
        try:
            content = req_path.read_text(encoding='utf-8', errors='ignore')
            if re.search(r'^mcp\b', content, re.MULTILINE) or re.search(r'^fastmcp\b', content, re.MULTILINE):
                has_python_sdk = True
                python_reasons.append("在 requirements.txt 中发现 mcp/fastmcp")
        except:
            pass

    # Scan Python files for imports
    if not has_python_sdk:
        for file in path.rglob("*.py"):
            if "venv" in str(file) or ".venv" in str(file): continue
            try:
                content = file.read_text(encoding='utf-8', errors='ignore')
                if "import fastmcp" in content or "from fastmcp" in content:
                    has_python_sdk = True
                    python_reasons.append(f"在 {file.name} 中发现 'import fastmcp'")
                    break
                if "import mcp" in content or "from mcp" in content:
                     # Check if it's likely the mcp library
                     if "mcp.server" in content or "mcp.types" in content or "Server" in content:
                        has_python_sdk = True
                        python_reasons.append(f"在 {file.name} 中发现 'import mcp' 使用")
                        break
            except:
                pass

    # 3. Decision Logic
    
    # Priority: If explicit SDK usage is found
    if has_python_sdk and has_ts_sdk:
        return "Other SDK", f"检测到混合使用 Python 和 TS SDK: {'; '.join(python_reasons + ts_reasons)}"
    elif has_python_sdk:
        return "python-sdk", "; ".join(python_reasons)
    elif has_ts_sdk:
        return "ts-sdk", "; ".join(ts_reasons)
    
    # 4. Check for Other SDK / Generic MCP
    # Look for README mentions or other file patterns
    is_mcp_related = False
    
    # Check README
    readme_path = None
    for f in path.glob("README*"):
        readme_path = f
        break
    
    if readme_path:
        try:
            content = readme_path.read_text(encoding='utf-8', errors='ignore').lower()
            if "mcp server" in content or "model context protocol" in content:
                is_mcp_related = True
                other_reasons.append("在 README 中发现 'MCP server' 或 'Model Context Protocol'")
        except:
            pass
            
    # Check for go.mod (Golang SDK?)
    if (path / "go.mod").exists():
        try:
            content = (path / "go.mod").read_text(encoding='utf-8', errors='ignore')
            if "github.com/modelcontextprotocol" in content: # Hypothetical check
                 return "Other SDK", "发现可能与 MCP 相关的 Go 模块"
        except:
            pass

    if is_mcp_related:
        return "Other SDK", "; ".join(other_reasons)

    return "Not MCP", "未发现 MCP SDK 或相关标志"

def main():
    results = []
    
    # Get all subdirectories
    root = Path(ROOT_DIR)
    if not root.exists():
        print(f"Error: Directory {ROOT_DIR} not found.")
        return

    projects = [d for d in root.iterdir() if d.is_dir()]
    projects.sort(key=lambda x: x.name)

    print(f"Analyzing {len(projects)} projects...")

    for project in projects:
        classification, reason = analyze_project(project)
        results.append({
            "Project Name": project.name,
            "Classification": classification,
            "Reason": reason
        })

    # Write CSV
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ["Project Name", "Classification", "Reason"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    print(f"Analysis complete. Results written to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

