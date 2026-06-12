#!/usr/bin/env python
"""
Flomo命令行工具入口脚本
"""
import sys
from pathlib import Path

# 添加项目根目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

from src.cli.__main__ import main

if __name__ == "__main__":
    main() 