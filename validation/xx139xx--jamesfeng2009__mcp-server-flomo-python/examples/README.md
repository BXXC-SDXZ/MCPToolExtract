# 示例代码

本目录包含各种示例代码，展示不同的实现方式。

## MCP服务器示例

`simple_server.py` - 一个基于MCP (Model Context Protocol) 的服务器实现。
这是一个尝试通过Cursor MCP集成与Flomo交互的早期实现。

### 使用方法

```bash
python simple_server.py
```

在启动前，确保已设置以下环境变量：
- `MCP_PORT`：服务器端口（默认为8823）
- `MCP_HOST`：服务器主机（默认为127.0.0.1）
- `FLOMO_API_URL`：Flomo API URL

### 提供的功能

- `add(a, b)`：将两个数字相加
- `hello(name)`：向某人问候
- `greeting://{name}`：获取个性化的问候 