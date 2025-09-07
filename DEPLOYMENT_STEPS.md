# 🚀 塔罗牌网站部署步骤

## 已完成 ✅
- [x] 准备所有文件
- [x] 初始化Git仓库
- [x] 提交所有文件到本地仓库

## 接下来需要您手动完成的步骤：

### 步骤1：创建GitHub仓库
1. 访问 https://github.com
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称：`ai-tarot-website`（或您喜欢的名字）
4. 描述：`AI驱动的塔罗牌占卜网站`
5. 选择 **Public**（免费用户只能部署公开仓库）
6. **不要**勾选 "Add a README file"（我们已经有了）
7. 点击 "Create repository"

### 步骤2：连接本地仓库到GitHub
复制GitHub给出的命令，类似这样：
```bash
git remote add origin https://github.com/您的用户名/ai-tarot-website.git
git branch -M main
git push -u origin main
```

### 步骤3：推送代码到GitHub
在终端中运行上面的命令（替换为您的实际仓库URL）

### 步骤4：启用GitHub Pages
1. 在GitHub仓库页面，点击 "Settings" 标签
2. 在左侧菜单中找到 "Pages"
3. 在 "Source" 下选择 "Deploy from a branch"
4. 在 "Branch" 下选择 "main"
5. 点击 "Save"

### 步骤5：等待部署完成
- GitHub Pages 通常需要几分钟来部署
- 您会看到一个绿色的勾号表示部署成功
- 您的网站将在以下地址可用：
  `https://您的用户名.github.io/ai-tarot-website/`

## 🎉 完成！
现在您可以：
1. 分享链接给朋友
2. 朋友可以直接使用您的OpenAI API密钥进行AI解牌
3. 享受专业的塔罗牌占卜体验

## 📱 分享给朋友
发送这个链接给您的朋友：
`https://您的用户名.github.io/ai-tarot-website/`

## ⚠️ 注意事项
- 您的OpenAI API密钥已经包含在代码中
- 请监控您的API使用量，避免超出限制
- 如果需要更换API密钥，只需修改 `ai-tarot-service.js` 文件并重新推送

## 🔧 如果需要更新网站
```bash
# 修改文件后
git add .
git commit -m "Update website"
git push
```

GitHub Pages 会自动重新部署！
