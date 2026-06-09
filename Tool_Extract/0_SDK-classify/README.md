# MCP 项目分析器

该工具分析一系列项目（假定为潜在的 Model Context Protocol 服务器），并根据它们使用的 SDK 对其进行分类。

## 功能

- 检测 **Python SDK** 使用情况（检查 `requirements.txt`、`pyproject.toml` 和 `fastmcp`/`mcp` 导入）。
- 检测 **TypeScript SDK** 使用情况（检查 `package.json` 和 `@modelcontextprotocol/sdk` 导入）。
- 检测 **其他 SDK** 或一般 MCP 相关性（检查 README 中的关键词）。
- 输出带有分类和原因的 CSV 报告。

## 使用方法

1.  确保已安装 Python 3。
2.  将您的项目放在一个目录中（默认为 `./random200`）。
3.  运行脚本：

    ```bash
    python analyze_mcp_projects.py
    ```

4.  查看输出文件 `mcp_analysis_results.csv`。

## 分类逻辑

- **python-sdk**：发现明确的 Python 依赖（`mcp`，`fastmcp`）或导入。
- **ts-sdk**：发现明确的 TypeScript/Node 依赖（`@modelcontextprotocol/sdk`）或导入。
- **Other SDK**：在文档中发现“MCP server”引用，但未发现标准 SDK 使用情况，或混合使用。
- **Not MCP**：未发现相关指标。
