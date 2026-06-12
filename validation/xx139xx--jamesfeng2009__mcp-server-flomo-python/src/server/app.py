"""
Web服务器应用 - 提供与Flomo交互的Web接口
"""
import logging
from flask import Flask, request, jsonify

from ..utils import FlomoClient, Config

# 配置日志
logger = logging.getLogger("flomo-server")

def create_app():
    """
    创建并配置Flask应用
    
    Returns:
        Flask: 配置好的Flask应用实例
    """
    # 创建Flask应用
    app = Flask(__name__)
    
    # 加载配置
    config = Config()
    
    # 创建Flomo客户端
    flomo_client = FlomoClient(config.flomo_api_url)
    
    @app.route('/')
    def index():
        """首页，显示简单的使用说明"""
        return """
        <html>
            <head>
                <title>Flomo Web 服务器</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                    pre { background: #f6f8fa; padding: 15px; border-radius: 5px; }
                    h1 { color: #333; }
                    .endpoint { font-weight: bold; color: #0366d6; }
                </style>
            </head>
            <body>
                <h1>Flomo Web 服务器</h1>
                <p>这是一个与 Flomo API 交互的简单 Web 服务器。</p>
                
                <h2>可用端点：</h2>
                <p><span class="endpoint">GET /test</span> - 测试服务器是否工作正常</p>
                <p><span class="endpoint">POST /write_note</span> - 发送笔记到 Flomo</p>
                
                <h2>写入笔记示例：</h2>
                <pre>
curl -X POST http://localhost:12345/write_note \\
    -H "Content-Type: application/json" \\
    -d '{"content": "这是一条通过 API 发送的测试笔记！\\n\\n支持 **Markdown** 格式\\n- 列表1\\n- 列表2\\n\\n> 引用文本"}'
                </pre>
            </body>
        </html>
        """

    @app.route('/test')
    def test():
        """测试端点，检查服务器是否正常工作"""
        logger.info("测试端点被调用")
        return jsonify({
            "status": "success",
            "message": "服务器工作正常",
            "flomo_api_url": config.flomo_api_url[:30] + "..." if len(config.flomo_api_url) > 30 else config.flomo_api_url
        })

    @app.route('/write_note', methods=['POST'])
    def write_note():
        """发送笔记到 Flomo"""
        try:
            data = request.json
            if not data or 'content' not in data:
                return jsonify({"error": "必须提供 content 字段"}), 400
            
            content = data['content']
            if not content:
                return jsonify({"error": "content 不能为空"}), 400
            
            logger.info(f"发送笔记到 Flomo: {content[:50]}{'...' if len(content) > 50 else ''}")
            
            # 发送笔记
            result = flomo_client.write_note(content)
            
            # 检查错误
            if "error" in result:
                logger.error(f"发送笔记失败: {result['error']}")
                return jsonify(result), 400
            
            return jsonify(result)
        
        except Exception as e:
            logger.error(f"处理请求时出错: {str(e)}")
            return jsonify({"error": str(e)}), 500
    
    return app 