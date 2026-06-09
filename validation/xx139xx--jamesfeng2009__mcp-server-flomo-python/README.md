# MCP Server for Flomo

这个项目提供了一个基于MCP (Model Context Protocol)的Web服务器和命令行工具，用于与Flomo API交互，以便在不同环境中方便地添加笔记到Flomo。

## 安装

### 从PyPI安装（推荐）

```bash
# 安装基本包
pip install mcp-server-flomo

# 安装开发依赖（可选）
pip install mcp-server-flomo[dev]
```

### 从源码安装

```bash
git clone https://github.com/yourusername/mcp-server-flomo-python.git
cd mcp-server-flomo-python
pip install -r requirements.txt
```

## 项目结构

```
.
├── flomo_cli.py         # 命令行工具入口脚本
├── flomo_server.py      # Web服务器入口脚本
├── src                  # 源代码目录
│   ├── cli              # 命令行工具模块
│   │   ├── __init__.py
│   │   ├── __main__.py  # CLI主入口
│   │   └── commands.py  # CLI命令实现
│   ├── server           # Web服务器模块
│   │   ├── __init__.py
│   │   ├── __main__.py  # 服务器主入口
│   │   └── app.py       # Flask应用实现
│   └── utils            # 工具模块
│       ├── __init__.py
│       ├── config.py    # 配置管理
│       └── flomo_client.py  # Flomo API客户端
├── tests                # 测试目录
└── docs                 # 文档目录
```

## 配置

1. 在项目根目录创建 `.env` 文件：

```
FLOMO_API_URL=https://flomoapp.com/iwh/你的ID/你的API密钥/
```

> 注意：FLOMO_API_URL 是必需的，你可以从 Flomo 网站的 设置 > API 页面获取。

## 使用方法

### 命令行工具

安装后，你可以直接使用 `flomo-cli` 命令：

```bash
# 测试连接
flomo-cli test

# 发送笔记
flomo-cli write "这是一条测试笔记"

# 从文件读取内容
flomo-cli write -f notes.md
```

### Web服务器

安装后，你可以直接使用 `flomo-server` 命令启动服务器：

```bash
flomo-server
```

或者使用参数：

```bash
flomo-server --port 8080 --host 127.0.0.1
```

服务器默认在 http://localhost:12345 上运行，提供以下端点：

- `GET /` - 显示使用说明
- `GET /test` - 测试服务器连接
- `POST /write_note` - 写入笔记到 Flomo

#### 示例：写入笔记

```bash
curl -X POST http://localhost:12345/write_note \
    -H "Content-Type: application/json" \
    -d '{"content": "这是一条测试笔记！\n\n支持 **Markdown** 格式\n- 列表1\n- 列表2\n\n> 引用文本"}'
```

## 开发

### 安装开发依赖

```bash
pip install -r requirements.txt
```

### 运行测试

```bash
pytest
```

### 代码格式化

```bash
black .
```

### 类型检查

```bash
mypy src
```

## 故障排除

1. 如果 Web 服务器无法启动，请检查端口 12345 是否已被占用
2. 如果连接到 Flomo API 失败，请检查 API URL 是否正确
3. 确保 `.env` 文件中的 FLOMO_API_URL 设置正确

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 相关链接

- [项目主页](https://github.com/yourusername/mcp-server-flomo-python)
- [PyPI包页面](https://pypi.org/project/mcp-server-flomo/)
- [Flomo官方网站](https://flomoapp.com)
- [Flomo API文档](https://help.flomoapp.com/advance/api)
