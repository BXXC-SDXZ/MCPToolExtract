"""
FlomoClient - 用于与Flomo API交互的客户端
"""
import logging
import requests
import json
from urllib.parse import urlparse

logger = logging.getLogger("flomo-client")

class FlomoClient:
    """与Flomo API交互的客户端类"""
    
    def __init__(self, api_url: str):
        """
        初始化Flomo客户端
        
        Args:
            api_url: Flomo API的URL
        """
        self.api_url = api_url
        logger.info(f"初始化Flomo客户端，API URL: {self.api_url}")
        
        # 验证API URL
        try:
            url = urlparse(api_url)
            if not all([url.scheme, url.netloc]):
                raise ValueError("无效的API URL格式")
            logger.info(f"API URL有效，协议: {url.scheme}, 主机: {url.netloc}, 路径: {url.path}")
        except Exception as e:
            logger.error(f"无效的API URL: {str(e)}")
            raise ValueError(f"无效的API URL: {str(e)}")
    
    def write_note(self, content: str) -> dict:
        """
        发送笔记到Flomo
        
        Args:
            content: 笔记内容，支持Markdown格式
            
        Returns:
            dict: 包含操作结果的字典
        """
        logger.info(f"正在发送笔记: {content[:50]}{'...' if len(content) > 50 else ''}")
        
        if not content:
            logger.error("笔记内容不能为空")
            raise ValueError("笔记内容不能为空")
        
        req = {"content": content}
        
        try:
            response = requests.post(
                self.api_url.strip(),
                json=req,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": "Flomo-Python-Client/1.0"
                }
            )
            
            if not response.ok:
                logger.error(f"请求失败，状态码: {response.status_code} {response.reason}")
                try:
                    return response.json()
                except:
                    return {
                        "error": f"请求失败，状态码 {response.status_code} {response.reason}",
                        "raw": response.text
                    }
            
            result = response.json()
            
            # 添加笔记URL
            if result.get("memo", {}).get("slug"):
                memo_url = f"https://v.flomoapp.com/mine/?memo_id={result['memo']['slug']}"
                result["memo"]["url"] = memo_url
                logger.info(f"已添加笔记URL: {memo_url}")
            
            return result
            
        except requests.RequestException as e:
            logger.error(f"网络错误: {str(e)}")
            return {"error": f"网络错误: {str(e)}"}
        except Exception as e:
            logger.error(f"发送笔记时出错: {str(e)}")
            return {"error": str(e)} 