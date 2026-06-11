"""
服务器入口模块 - 用于直接运行服务器
"""
import logging
import argparse
from pathlib import Path
import sys

# 添加父目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.utils import Config
from src.server import create_app

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("flomo-server")

def main():
    """主函数，启动Web服务器"""
    parser = argparse.ArgumentParser(description="Flomo Web服务器")
    parser.add_argument("--port", type=int, help="服务器端口")
    parser.add_argument("--host", help="服务器主机名")
    parser.add_argument("--env", help=".env文件路径")
    args = parser.parse_args()

    # 加载配置
    try:
        env_file = args.env if args.env else None
        config = Config(env_file)
        
        # 命令行参数覆盖环境变量
        port = args.port if args.port else config.server_port
        host = args.host if args.host else config.server_host
        
        # 创建并运行应用
        app = create_app()
        logger.info(f"启动Flomo Web服务器，端口: {port}")
        app.run(host=host, port=port, debug=True)
    
    except Exception as e:
        logger.error(f"启动服务器时出错: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 