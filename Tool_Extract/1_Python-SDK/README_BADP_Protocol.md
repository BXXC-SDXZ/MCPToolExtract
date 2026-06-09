# Methodology: Extracting Tool Contexts from MCP Python Servers

## Abstract
This document details the methodology used to extract high-quality, executable tool definitions from MCP (Model Context Protocol) Python-based servers. The process involves identifying tool entry points through static analysis and reconstructing their minimal execution context by resolving local dependencies via a budget-constrained graph traversal.

## 1. Tool Entry Point Identification
We employ Abstract Syntax Tree (AST) static analysis to identify tool definitions. The extraction logic is robust against different coding styles and supports three primary registration patterns:

### 1.1 Decorator Pattern
The most common pattern involves decorating functions with MCP SDK markers. We scan `FunctionDef` and `AsyncFunctionDef` nodes for the following decorators:
*   `@mcp.tool()`
*   `@fastmcp.tool()`
*   `@tool`

This captures both synchronous and asynchronous implementations widely used in the official Python SDK and FastMCP framework.

### 1.2 Class Instantiation Pattern
Some implementations explicitly verify tool instances, often found in higher-level SDK wrappers (e.g., AWS or Azure integrations). We detect `Call` nodes that instantiate a `Tool` class:
*   **Signature**: `Tool(name="...", description="...", fn=...)`
*   **Extraction**: We parse the keyword arguments to extract the tool's metadata and associated function logic.

### 1.3 Manual Registration Pattern
For dynamic or legacy implementations, tools may be registered via direct function calls. We identify expressions matching the pattern:
*   **Pattern**: `mcp.tool()(func_name)`
*   **Logic**: The script traces the `func_name` back to its original function definition within the file to extract the docstring and source code, rather than just capturing the registration line.

---

## 2. Context Reconstruction (Dependency Resolution)
Isolated function code is often insufficient for execution or learning (LLM training) due to missing dependencies. We reconstruct the execution context using the following protocol:

### 2.1 Global Symbol Indexing
Before processing, we build a project-wide symbol table mapping every function and class definition to its source code and file path. This enables resolving dependencies that cross file boundaries (within the project scope).

### 2.2 Transitive Closure with Budget Constraints
Starting from the tool entry point, we compute the **transitive closure** of its function call graph. To prevent context explosion (where a tool drags in excessive irrelevant code) and ensure high signal-to-noise ratio, we apply a **Budget-Aware Traversal Strategy**:

*   **Priority Queue BFS**: Dependencies are extracted based on distance from the entry point. Direct calls (distance=1) are prioritized over indirect ones.
*   **Soft Limit (15 Dependencies)**: When the dependency count reaches 15, we stop expanding new branches to prevent extracting peripheral logic, while ensuring the core call chain is preserved.
*   **Hard Limit (20 Dependencies)**: To maintain a manageable context window, we enforce a strict upper limit. If dependencies exceed 20, the traversal halts, returning the 20 most relevant dependencies found thus far.

### 2.3 Semantic Denoising
To optimize token usage without losing structural information, we apply AST-level transformations:
*   **Constant Truncation**: Large static data structures (e.g., embedded dictionaries or strings > 500 characters) are detected and truncated (e.g., `DATA = [...] # Truncated`). This reduces token consumption while preserving the variable definition for semantic completeness.

## 3. Output Format
The final dataset encapsulates each tool as a self-contained unit using a structured XML format:

```xml
<tool_bundle>
  <entry_point>
    <!-- The main tool function identified in Step 1 -->
    @mcp.tool()
    def calculate_metrics(...): ...
  </entry_point>
  <internal_dependencies>
    <!-- The resolved context from Step 2 -->
    def helper_a(...): ...
    def helper_b(...): ...
  </internal_dependencies>
</tool_bundle>
```
