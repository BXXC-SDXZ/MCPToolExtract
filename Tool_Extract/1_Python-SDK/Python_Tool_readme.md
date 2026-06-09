# MCP Python Tool Extractor

该工具基于 `mcp_analysis_results.csv` 的分析结果，针对识别为 **python-sdk** 的项目，提取其定义的 Tool（工具）源代码及描述。

## 功能

1.  **自动识别项目**：读取 `mcp_analysis_results.csv`，仅处理标记为 `python-sdk` 的项目。
2.  **Server 描述提取**：尝试从 `README.md` 或 `pyproject.toml` 中提取 Server 的描述信息。
3.  **Tool 提取**：
    该脚本使用 AST 静态分析，支持三种主要的工具定义模式：
    *   **装饰器模式**：识别 `@mcp.tool()`, `@fastmcp.tool()`, `@tool` 等装饰器。支持同步 `def` 和异步 `async def` 函数。
    *   **类实例化模式**：识别 `Tool(name="...", ...)` 的显式实例化调用（常见于 AWS 等 SDK 封装中）。
    *   **手动注册模式**：识别 `mcp.tool()(func_name)` 形式的显式调用。
4.  **输出生成**：
    *   `mcp_tools.json`: 包含详细的 Server 信息和 Tool 列表（源码、描述）。
    *   `mcp_analysis_results_with_tools.csv`: 在原 CSV 基础上增加 "Tool Count" 列。

## 使用方法

1.  确保当前目录下存在 `mcp_analysis_results.csv` 文件（由上一步任务生成）。
2.  确保 `./random200` 目录下有项目源码。
3.  运行脚本：

    ```bash
    python extract_mcp_tools.py
    ```

4.  查看输出文件 `mcp_tools.json` 和 `mcp_analysis_results_with_tools.csv`。

## JSON 输出格式示例

```json
[
    {
        "server": "project_name",
        "server-sdk": "python",
        "server_description": "Server description...",
        "tool_count": 2,
        "toollist": [
            {
                "name": "calculate_sum",
                "source": "def calculate_sum(a, b):\n    '''Calculates sum'''\n    return a + b",
                "description": "Calculates sum"
            },
            ...
        ]
    },
    ...
]
```
