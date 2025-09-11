# Firebase 配置指南

## 1. 创建Firebase项目

### 步骤1：访问Firebase控制台
1. 打开 [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. 使用你的Google账户登录

### 步骤2：创建新项目
1. 点击"创建项目"或"Add project"
2. 项目名称：建议使用 "momentum-tracker" 或类似名称
3. 启用Google Analytics（可选，建议启用）
4. 选择Analytics账户（如果启用）

## 2. 启用Authentication

### 步骤1：进入Authentication
1. 在左侧菜单选择"Authentication"
2. 点击"开始使用"

### 步骤2：配置Google登录
1. 在"Sign-in method"标签页中
2. 找到"Google"并点击启用
3. 配置OAuth同意屏幕（如果还没有的话）：
   - 选择用户类型（外部或内部）
   - 填写应用信息
   - 添加授权域名（你的网站域名）
4. 保存配置

## 3. 创建Firestore数据库

### 步骤1：进入Firestore Database
1. 在左侧菜单选择"Firestore Database"
2. 点击"创建数据库"

### 步骤2：配置数据库
1. 选择"测试模式"（稍后我们会设置安全规则）
2. 选择离你最近的区域（建议选择asia-southeast1或asia-northeast1）
3. 点击"完成"

## 4. 获取配置信息

### 步骤1：进入项目设置
1. 点击左侧菜单的齿轮图标（项目设置）
2. 滚动到"你的应用"部分

### 步骤2：添加Web应用
1. 点击"Web"图标（</>）
2. 应用昵称：momentum-tracker
3. 勾选"为此应用设置Firebase Hosting"（可选）
4. 点击"注册应用"

### 步骤3：复制配置
复制显示的配置对象，类似这样：
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 5. 更新代码配置

### 步骤1：替换配置
1. 打开 `010DOM.html` 文件
2. 找到第20-27行的配置对象
3. 用你从Firebase控制台复制的配置替换

### 步骤2：配置授权域名
1. 在Firebase控制台的Authentication设置中
2. 在"授权域名"部分添加你的网站域名
3. 如果是本地测试，添加 `localhost`

## 6. 设置Firestore安全规则

### 步骤1：进入Firestore规则
1. 在Firestore Database页面
2. 点击"规则"标签页

### 步骤2：更新规则
将规则替换为以下内容：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 记录集合
      match /records/{recordId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // 任务集合
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 步骤3：发布规则
1. 点击"发布"按钮
2. 确认发布

## 7. 测试功能

### 步骤1：本地测试
1. 使用本地服务器打开网站（不要直接双击HTML文件）
2. 可以使用Python简单服务器：
   ```bash
   python -m http.server 8000
   ```
3. 访问 `http://localhost:8000`

### 步骤2：测试登录
1. 点击"使用Google登录"按钮
2. 完成Google OAuth流程
3. 检查是否显示用户信息

### 步骤3：测试数据同步
1. 添加一些记录和任务
2. 刷新页面，检查数据是否保持
3. 在另一个浏览器中登录同一账户，检查数据是否同步

## 8. 部署到生产环境

### 选项1：Firebase Hosting（推荐）
1. 安装Firebase CLI：
   ```bash
   npm install -g firebase-tools
   ```
2. 登录Firebase：
   ```bash
   firebase login
   ```
3. 初始化项目：
   ```bash
   firebase init hosting
   ```
4. 部署：
   ```bash
   firebase deploy
   ```

### 选项2：其他静态托管服务
- GitHub Pages
- Netlify
- Vercel
- 任何支持静态文件的托管服务

## 9. 常见问题

### Q: 登录失败怎么办？
A: 检查：
- Firebase配置是否正确
- 授权域名是否包含你的网站域名
- 浏览器控制台是否有错误信息

### Q: 数据不同步怎么办？
A: 检查：
- 网络连接是否正常
- Firestore安全规则是否正确
- 用户是否已登录

### Q: 如何备份数据？
A: 可以通过Firebase控制台导出数据，或使用Firebase Admin SDK创建备份脚本

## 10. 安全建议

1. **定期更新安全规则**：根据应用需求调整规则
2. **监控使用情况**：在Firebase控制台查看使用统计
3. **设置预算警报**：避免意外费用
4. **定期备份数据**：确保数据安全

## 11. 成本说明

Firebase免费额度：
- Firestore：每月1GB存储，10GB传输
- Authentication：免费
- Hosting：每月10GB存储，10GB传输

对于个人使用，通常不会超出免费额度。

---

配置完成后，你的网站就具备了：
- Google账户登录
- 云端数据同步
- 跨设备数据访问
- 数据安全保障

如有问题，请检查浏览器控制台的错误信息。
