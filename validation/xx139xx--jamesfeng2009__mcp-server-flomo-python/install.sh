#!/bin/bash
# Flomo工具安装脚本

echo "====== Flomo工具安装 ======"
echo "安装所需的Python依赖..."
pip install -e .

echo "创建.env文件..."
if [ ! -f .env ]; then
    echo "FLOMO_API_URL=https://flomoapp.com/iwh/你的ID/你的API密钥/" > .env
    echo ".env文件已创建，请编辑该文件，更新你的Flomo API URL"
else
    echo ".env文件已存在，跳过创建"
fi

echo "赋予脚本执行权限..."
chmod +x flomo_server.py
chmod +x flomo_cli.py

echo "====== 安装完成 ======"
echo ""
echo "使用方法："
echo "1. 启动Web服务器: ./flomo_server.py"
echo "2. 使用命令行工具: ./flomo_cli.py write \"你的笔记内容\""
echo "3. 测试服务器连接: ./flomo_cli.py test"
echo ""
echo "更多详情请参考README.md文件" 