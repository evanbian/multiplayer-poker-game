# 多人德州扑克游戏 - 问题诊断与调试指南

本指南旨在帮助您诊断和解决在运行多人德州扑克游戏时可能遇到的常见问题。

## 运行问题

### 启动失败

**症状**: 启动前端或后端服务时出现错误。

**可能的原因与解决方案**:

1. **依赖未正确安装**
   ```bash
   # 重新安装依赖
   cd [client或server目录]
   rm -rf node_modules
   npm install
   ```

2. **端口被占用**
   ```bash
   # 检查端口占用情况
   # Windows
   netstat -ano | findstr 3001
   
   # MacOS/Linux
   lsof -i :3001
   
   # 修改端口 (在server/.env中)
   PORT=3002  # 使用其他可用端口
   ```

3. **环境变量文件丢失**
   ```bash
   # 检查server目录中是否有.env文件
   # 如果没有，从.env.example复制一份
   cd server
   cp .env.example .env
   ```

### 前后端连接问题

**症状**: 前端无法连接到后端，页面显示连接错误。

**可能的原因与解决方案**:

1. **后端服务未启动**
   - 确保在单独的终端中运行了后端服务
   - 检查后端服务是否有错误日志

2. **Socket.IO连接配置错误**
   ```javascript
   // 检查client/src/services/socket/socketService.js中的服务器URL
   export const initSocket = (serverUrl = 'http://localhost:3001') => {
     // 确保URL与服务器实际运行的地址和端口匹配
   }
   ```

3. **CORS配置问题**
   ```javascript
   // 在server/src/app.js中检查CORS配置
   app.use(cors({
     origin: CLIENT_URL, // 确保环境变量CLIENT_URL正确设置
     methods: ['GET', 'POST']
   }));
   ```

## 游戏功能问题

### 玩家无法入座

**症状**: 点击入座按钮无反应或出现错误。

**可能的原因与解决方案**:

1. **游戏已开始**
   - 在游戏进行中无法入座，等待当前局结束

2. **座位已被占用**
   - 座位信息可能未及时同步，尝试刷新页面
   - 检查服务器日志中的座位状态

3. **Socket连接问题**
   - 检查控制台是否有Socket相关错误
   - 尝试重新连接Socket（刷新页面）

### 游戏无法开始

**症状**: 所有玩家都准备了，但游戏没有自动开始。

**可能的原因与解决方案**:

1. **玩家数量不足**
   - 确保至少有2名玩家入座并准备

2. **服务器游戏状态错误**
   ```bash
   # 检查服务器日志
   cd server
   tail -f logs/combined.log
   ```

3. **准备状态同步问题**
   - 所有玩家可以尝试取消准备然后重新准备

### 游戏动作无反应

**症状**: 点击下注、加注等按钮无反应。

**可能的原因与解决方案**:

1. **不是您的回合**
   - 确认当前是否轮到您行动（应有高亮提示）

2. **客户端状态不同步**
   - 刷新页面重新加载游戏状态

3. **动作验证失败**
   - 检查是否满足动作条件（如筹码是否足够）
   - 查看浏览器控制台中的错误信息

## 性能与UI问题

### 界面卡顿

**症状**: 游戏界面响应缓慢或动画不流畅。

**可能的原因与解决方案**:

1. **设备性能限制**
   - 关闭其他应用程序释放资源
   - 在更高性能的设备上运行游戏

2. **渲染优化问题**
   - 修改`client/src/components/game/GameTable.js`中的动画效果
   - 减少不必要的重渲染

### 界面显示异常

**症状**: UI元素位置错乱或样式异常。

**可能的原因与解决方案**:

1. **浏览器兼容性问题**
   - 尝试使用Chrome或Firefox最新版本
   - 清除浏览器缓存后重试

2. **样式冲突**
   - 检查styled-components样式定义
   - 使用浏览器开发者工具检查元素样式

## 网络问题

### 局域网连接失败

**症状**: 其他设备无法连接到游戏服务器。

**可能的原因与解决方案**:

1. **服务器绑定到localhost**
   ```javascript
   // 修改server/src/app.js中的监听设置
   server.listen(PORT, '0.0.0.0', () => {
     console.log(`服务器运行在端口 ${PORT}`);
   });
   ```

2. **防火墙阻止**
   - 检查主机防火墙设置，允许TCP端口3001（或您配置的端口）

3. **网络隔离**
   - 确保所有设备在同一局域网内
   - 检查路由器设置是否允许局域网设备互联

### 频繁断线

**症状**: 游戏中经常断开连接。

**可能的原因与解决方案**:

1. **网络不稳定**
   - 使用有线连接代替WiFi
   - 检查网络质量

2. **Socket.IO重连配置**
   ```javascript
   // 调整client/src/services/socket/socketService.js中的重连设置
   socket = io(serverUrl, {
     reconnectionAttempts: 10, // 增加重连尝试次数
     reconnectionDelay: 1000, // 重连延迟时间
     timeout: 20000, // 增加超时时间
   });
   ```

## 调试技巧

### 前端调试

1. **使用React Developer Tools**
   - 在Chrome或Firefox中安装React开发者工具扩展
   - 检查组件层次结构和props传递

2. **Redux状态检查**
   - 在Chrome中安装Redux DevTools扩展
   - 监控状态变化和action分发

3. **启用详细日志**
   ```javascript
   // 在client/src/services/socket/socketService.js中添加调试日志
   console.log('Socket event:', eventName, data);
   ```

### 后端调试

1. **查看服务器日志**
   ```bash
   cd server
   tail -f logs/combined.log
   ```

2. **增加日志详细度**
   ```
   # 在server/.env中修改
   LOG_LEVEL=debug
   ```

3. **使用Node.js调试器**
   ```bash
   # 使用--inspect启动服务器
   node --inspect src/app.js
   ```

## 项目修改指南

如果您需要对项目进行自定义修改，以下是一些常见修改点：

### 修改游戏规则

- `server/src/services/game/index.js` - 游戏核心逻辑
- `server/src/config/index.js` - 游戏配置参数

### 自定义界面样式

- `client/src/components/game/*.js` - 游戏组件样式
- `client/src/styles/global.css` - 全局样式

### 添加新功能

- 遵循项目的文件结构组织
- 在添加新功能前先创建相应的Redux状态管理
- 确保前后端逻辑一致

## 提交问题

如果您遇到本指南未涵盖的问题，请提供以下信息创建GitHub issue：

1. 问题的详细描述
2. 复现步骤
3. 预期行为与实际行为
4. 环境信息（操作系统、Node.js版本、浏览器版本）
5. 相关日志和错误信息
6. 截图（如适用）

---

希望本指南能帮助您解决在使用多人德州扑克游戏过程中遇到的问题！
