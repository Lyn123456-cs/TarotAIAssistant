# 塔罗牌网站部署指南

## 方案一：GitHub Pages（推荐）

### 步骤：
1. **创建GitHub仓库**
   - 访问 https://github.com
   - 点击 "New repository"
   - 仓库名：`tarot-website` 或任何您喜欢的名字
   - 选择 "Public"（免费用户只能部署公开仓库）

2. **上传文件**
   - 将项目文件夹中的所有文件上传到仓库
   - 或者使用Git命令行：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/您的用户名/仓库名.git
   git push -u origin main
   ```

3. **启用GitHub Pages**
   - 进入仓库设置（Settings）
   - 找到 "Pages" 选项
   - Source 选择 "Deploy from a branch"
   - Branch 选择 "main"
   - 点击 "Save"

4. **访问网站**
   - 几分钟后，您的网站将在以下地址可用：
   - `https://您的用户名.github.io/仓库名/`

### 优点：
- ✅ 完全免费
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 自定义域名支持

### 缺点：
- ❌ 只能部署静态网站（无后端）
- ❌ 需要公开仓库

---

## 方案二：Netlify（推荐）

### 步骤：
1. **访问 Netlify**
   - 访问 https://netlify.com
   - 使用GitHub账号登录

2. **部署网站**
   - 点击 "New site from Git"
   - 连接您的GitHub仓库
   - 选择仓库和分支
   - 点击 "Deploy site"

3. **自定义域名**
   - 在站点设置中可以修改域名
   - 例如：`your-tarot-site.netlify.app`

### 优点：
- ✅ 完全免费
- ✅ 自动部署
- ✅ 自定义域名
- ✅ 表单处理
- ✅ 更快的部署速度

---

## 方案三：Vercel（推荐）

### 步骤：
1. **访问 Vercel**
   - 访问 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 导入您的GitHub仓库
   - 点击 "Deploy"

3. **访问网站**
   - 部署完成后会获得一个 `.vercel.app` 域名

### 优点：
- ✅ 完全免费
- ✅ 极快的部署速度
- ✅ 自动HTTPS
- ✅ 全球CDN

---

## 方案四：本地网络共享

### 步骤：
1. **获取本机IP地址**
   ```bash
   # Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **启动服务器**
   ```bash
   python3 -m http.server 8000 --bind 0.0.0.0
   ```

3. **朋友访问**
   - 朋友在浏览器输入：`http://您的IP:8000`
   - 例如：`http://192.168.1.100:8000`

### 优点：
- ✅ 无需注册账号
- ✅ 完全免费
- ✅ 立即可用

### 缺点：
- ❌ 只能在同一网络下访问
- ❌ 需要您的电脑一直开着

---

## 重要提醒

### API密钥安全：
- ⚠️ **不要将API密钥直接写在代码中**
- ⚠️ **使用环境变量或配置文件**
- ⚠️ **考虑使用免费的AI服务替代**

### 建议的API配置方式：
```javascript
// 在ai-tarot-service.js中
const apiKey = process.env.OPENAI_API_KEY || '';

// 或者让用户自己配置
const apiKey = localStorage.getItem('user_api_key') || '';
```

### 免费AI替代方案：
1. **使用免费的AI模型**
2. **让用户自己配置API密钥**
3. **提供传统解牌作为备用**

---

## 推荐部署流程

1. **选择 GitHub Pages**（最简单）
2. **创建公开仓库**
3. **上传代码文件**
4. **启用Pages功能**
5. **分享链接给朋友**

这样您的朋友就可以通过互联网访问您的塔罗牌网站了！
