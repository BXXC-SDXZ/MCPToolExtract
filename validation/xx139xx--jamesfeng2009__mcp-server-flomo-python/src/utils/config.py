"""
配置工具 - 用于加载和管理配置
"""
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger("flomo-config")

class Config:
    """配置管理类"""
    
    def __init__(self, env_file=None):
        """
        初始化配置
        
        Args:
            env_file: .env文件路径，默认为None（自动查找）
        """
        # 找到项目根目录
        self.project_root = self._find_project_root()
        
        # 如果没有指定env_file，尝试查找
        if env_file is None:
            env_file = self.project_root / '.env'
        
        # 加载环境变量
        load_dotenv(env_file)
        logger.info(f"从 {env_file} 加载环境变量")
        
        # 基本配置
        self.flomo_api_url = os.getenv("FLOMO_API_URL")
        self.server_port = int(os.getenv("PORT", 12345))
        self.server_host = os.getenv("HOST", "0.0.0.0")
        
        # 验证必要的配置
        if not self.flomo_api_url:
            logger.error("FLOMO_API_URL 环境变量未设置")
            raise ValueError("FLOMO_API_URL 环境变量必须设置")
    
    def _find_project_root(self) -> Path:
        """查找项目根目录"""
        current_dir = Path.cwd()
        
        # 向上查找，直到找到包含.env或者README.md的目录
        for parent in [current_dir] + list(current_dir.parents):
            if (parent / '.env').exists() or (parent / 'README.md').exists():
                logger.info(f"找到项目根目录: {parent}")
                return parent
        
        # 如果找不到，使用当前目录
        logger.warning(f"无法找到项目根目录，使用当前目录: {current_dir}")
        return current_dir 