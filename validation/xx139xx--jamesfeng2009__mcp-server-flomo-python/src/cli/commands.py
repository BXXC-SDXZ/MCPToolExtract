"""
命令行工具命令 - 实现CLI命令的功能
"""
import requests
import json
from pathlib import Path
import logging

logger = logging.getLogger("flomo-cli")

def test_server(server_url: str) -> bool:
    """
    测试服务器是否正常工作
    
    Args:
        server_url: 服务器URL
        
    Returns:
        bool: 测试是否成功
    """
    try:
        response = requests.get(f"{server_url}/test")
        if response.ok:
            result = response.json()
            print("✅ 服务器状态:", result["message"])
            print("🔗 Flomo API URL:", result["flomo_api_url"])
            return True
        else:
            print("❌ 服务器错误:", response.status_code, response.reason)
            try:
                print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            except:
                print(response.text)
            return False
    except requests.RequestException as e:
        print(f"❌ 无法连接到服务器: {str(e)}")
        logger.error(f"无法连接到服务器: {str(e)}")
        return False

def write_note(server_url: str, content: str = None, file: str = None) -> bool:
    """
    写入笔记到Flomo
    
    Args:
        server_url: 服务器URL
        content: 笔记内容
        file: 笔记文件路径
        
    Returns:
        bool: 操作是否成功
    """
    try:
        # 如果指定了文件，则从文件读取内容
        if file:
            filepath = Path(file)
            if not filepath.exists():
                print(f"❌ 文件不存在: {file}")
                logger.error(f"文件不存在: {file}")
                return False
            
            content = filepath.read_text(encoding="utf-8")
            print(f"📄 已读取文件: {file} ({len(content)} 字符)")
        
        # 确保内容不为空
        if not content:
            print("❌ 内容不能为空")
            logger.error("内容不能为空")
            return False
        
        # 发送请求
        response = requests.post(
            f"{server_url}/write_note",
            json={"content": content},
            headers={"Content-Type": "application/json"}
        )
        
        if response.ok:
            result = response.json()
            print("✅ 笔记已成功发送！")
            
            if result.get("memo", {}).get("url"):
                print("🔗 笔记链接:", result["memo"]["url"])
            
            return True
        else:
            print("❌ 发送笔记失败:", response.status_code, response.reason)
            try:
                print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            except:
                print(response.text)
            logger.error(f"发送笔记失败: {response.status_code} {response.reason}")
            return False
    
    except requests.RequestException as e:
        print(f"❌ 请求错误: {str(e)}")
        logger.error(f"请求错误: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ 未知错误: {str(e)}")
        logger.error(f"未知错误: {str(e)}")
        return False 