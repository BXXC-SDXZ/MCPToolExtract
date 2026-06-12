"""
命令行工具入口模块 - 用于直接运行CLI命令
"""
import argparse
import logging
import os
import sys
from pathlib import Path

# 添加父目录到Python路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.cli import test_server, write_note

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("flomo-cli")

# Web服务器地址
SERVER_URL = os.getenv("FLOMO_SERVER_URL", "http://localhost:12345")

def main():
    """主函数，处理命令行参数"""
    parser = argparse.ArgumentParser(description="Flomo CLI - 与Flomo Web服务器交互的命令行工具")
    
    # 服务器URL选项
    parser.add_argument("--server", default=SERVER_URL, help=f"服务器URL (默认: {SERVER_URL})")
    
    # 创建子命令
    subparsers = parser.add_subparsers(dest="command", help="可用命令")
    
    # test命令
    test_parser = subparsers.add_parser("test", help="测试服务器连接")
    
    # write命令
    write_parser = subparsers.add_parser("write", help="写入笔记到Flomo")
    write_parser.add_argument("content", nargs="?", help="笔记内容")
    write_parser.add_argument("-f", "--file", help="从文件读取笔记内容")
    
    # 解析参数
    args = parser.parse_args()
    
    # 处理命令
    if args.command == "test":
        success = test_server(args.server)
        sys.exit(0 if success else 1)
    elif args.command == "write":
        if args.file:
            success = write_note(args.server, None, args.file)
        elif args.content:
            success = write_note(args.server, args.content)
        else:
            print("❌ 请提供笔记内容或指定文件")
            write_parser.print_help()
            sys.exit(1)
        sys.exit(0 if success else 1)
    else:
        parser.print_help()
        sys.exit(0)

if __name__ == "__main__":
    main() 