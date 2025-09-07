#!/bin/bash

# 塔罗牌网站部署脚本

echo "🔮 塔罗牌网站部署助手"
echo "========================"

# 检查是否安装了git
if ! command -v git &> /dev/null; then
    echo "❌ 请先安装 Git"
    echo "访问: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git 已安装"

# 检查是否在项目目录中
if [ ! -f "index.html" ]; then
    echo "❌ 请在项目根目录中运行此脚本"
    exit 1
fi

echo "✅ 项目文件检查完成"

# 创建.gitignore文件
cat > .gitignore << EOF
# 忽略敏感信息
ai-tarot-service.js
*.log
.DS_Store
node_modules/
EOF

echo "✅ 创建 .gitignore 文件"

# 初始化git仓库（如果还没有）
if [ ! -d ".git" ]; then
    git init
    echo "✅ 初始化 Git 仓库"
fi

# 添加所有文件
git add .

# 提交更改
git commit -m "Deploy Tarot Website - $(date)"

echo "✅ 文件已提交到 Git"

echo ""
echo "🚀 部署选项："
echo "1. GitHub Pages (推荐)"
echo "2. Netlify"
echo "3. Vercel"
echo "4. 本地网络共享"
echo ""

read -p "请选择部署方式 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📋 GitHub Pages 部署步骤："
        echo "1. 访问 https://github.com"
        echo "2. 创建新仓库 (选择 Public)"
        echo "3. 复制仓库URL"
        echo "4. 运行以下命令："
        echo ""
        echo "git remote add origin <您的仓库URL>"
        echo "git branch -M main"
        echo "git push -u origin main"
        echo ""
        echo "5. 在仓库设置中启用 GitHub Pages"
        echo "6. 选择 'Deploy from a branch' -> 'main'"
        echo ""
        ;;
    2)
        echo ""
        echo "📋 Netlify 部署步骤："
        echo "1. 访问 https://netlify.com"
        echo "2. 使用 GitHub 登录"
        echo "3. 点击 'New site from Git'"
        echo "4. 选择您的仓库"
        echo "5. 点击 'Deploy site'"
        echo ""
        ;;
    3)
        echo ""
        echo "📋 Vercel 部署步骤："
        echo "1. 访问 https://vercel.com"
        echo "2. 使用 GitHub 登录"
        echo "3. 点击 'New Project'"
        echo "4. 导入您的仓库"
        echo "5. 点击 'Deploy'"
        echo ""
        ;;
    4)
        echo ""
        echo "📋 本地网络共享："
        echo "1. 获取您的IP地址："
        echo "   ifconfig | grep 'inet ' | grep -v 127.0.0.1"
        echo ""
        echo "2. 启动服务器："
        echo "   python3 -m http.server 8000 --bind 0.0.0.0"
        echo ""
        echo "3. 朋友访问："
        echo "   http://您的IP:8000"
        echo ""
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "⚠️  重要提醒："
echo "- 请确保不要将API密钥上传到公开仓库"
echo "- 建议让用户自己配置API密钥"
echo "- 或者使用免费的AI服务"
echo ""
echo "🎉 部署完成！您的朋友现在可以访问您的塔罗牌网站了！"
