#!/usr/bin/env python
"""
サーバー起動のためのヘルパースクリプト
"""

import asyncio
import logging
import os
import sys

# パスの設定
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, "src")
sys.path.insert(0, src_dir)

# 必要なモジュールを直接インポート
sys.path.insert(0, os.path.join(src_dir, "mysql_mcp_server"))

# ロギングの設定
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("mysql_mcp_server")


# サーバーの起動
async def run_server():
    try:
        logger.info("Starting MySQL MCP server...")

        # 必要なモジュールをインポート
        from mysql_mcp_server.server import main

        await main()
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    asyncio.run(run_server())
