#!/bin/bash

echo "🔮 塔罗牌网站快速部署脚本"
echo "=========================="

# 检查是否在项目目录中
if [ ! -f "index.html" ]; then
    echo "❌ 请在项目根目录中运行此脚本"
    exit 1
fi

echo "✅ 项目文件检查完成"

# 检查Git状态
if [ ! -d ".git" ]; then
    echo "❌ 请先运行 git init"
    exit 1
fi

echo "✅ Git仓库已初始化"

# 添加所有文件
git add .

# 提交更改
git commit -m "Deploy AI Tarot Website - $(date '+%Y-%m-%d %H:%M:%S')"

echo "✅ 文件已提交到本地仓库"

echo ""
echo "📋 接下来请按以下步骤操作："
echo ""
echo "1. 访问 https://github.com"
echo "2. 点击 'New repository'"
echo "3. 仓库名：ai-tarot-website"
echo "4. 选择 Public"
echo "5. 点击 'Create repository'"
echo "6. 复制仓库URL（类似：https://github.com/YanlingLiu/ai-tarot-website.git）"
echo ""

read -p "请输入您的GitHub仓库URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ 仓库URL不能为空"
    exit 1
fi

# 添加远程仓库
git remote add origin "$repo_url"

# 推送到GitHub
echo "🚀 正在推送到GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📱 您的网站地址："
    echo "https://YanlingLiu.github.io/ai-tarot-website/"
    echo ""
    echo "📋 最后一步："
    echo "1. 访问您的GitHub仓库"
    echo "2. 点击 'Settings'"
    echo "3. 找到 'Pages'"
    echo "4. Source 选择 'Deploy from a branch'"
    echo "5. Branch 选择 'main'"
    echo "6. 点击 'Save'"
    echo ""
    echo "⏰ 等待几分钟后，您的朋友就可以访问网站了！"
    echo ""
    echo "🔗 分享链接：https://YanlingLiu.github.io/ai-tarot-website/"
else
    echo "❌ 推送失败，请检查仓库URL是否正确"
fi
