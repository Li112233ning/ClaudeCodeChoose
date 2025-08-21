# Claude Key Manager

一个安全、简洁、高效的 Claude API 密钥管理桌面应用，采用小红书风格的界面设计。

![Claude Key Manager](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## ✨ 特性

### 🔐 安全性
- **加密存储**：API 密钥使用 AES-256-GCM 加密存储
- **系统集成**：支持 macOS Keychain 和 Windows Credential Manager
- **内存保护**：敏感数据及时清除，防止内存泄露
- **安全架构**：禁用 Node.js 集成，防止 XSS 攻击

### 🎯 功能性
- **多源管理**：支持添加、编辑、删除多个 API 源
- **动态切换**：一键切换不同的 API 来源
- **连接测试**：内置连接测试功能
- **配置备份**：支持配置导出和导入

### 🎨 界面设计
- **小红书风格**：清新、简约、留白多的设计理念
- **响应式布局**：适配不同屏幕尺寸
- **流畅动画**：精心设计的过渡效果
- **深色模式**：支持浅色/深色/跟随系统模式

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动 React 开发服务器
npm start

# 在另一个终端启动 Electron
npm run electron-dev
```

### 构建应用

```bash
# 构建生产版本
npm run build

# 打包 Electron 应用
npm run dist
```

### 仅打包（不分发）

```bash
npm run pack
```

## 📦 项目结构

```
claude-key-manager/
├── public/
│   ├── main.js           # Electron 主进程
│   ├── preload.js        # 预加载脚本
│   ├── database.js       # 数据库管理
│   └── index.html        # HTML 模板
├── src/
│   ├── components/       # React 组件
│   ├── store/           # 状态管理
│   ├── App.tsx          # 主应用组件
│   ├── index.tsx        # 应用入口
│   └── index.css        # 样式文件
├── package.json         # 项目配置
├── tailwind.config.js   # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

## 🔧 技术栈

### 前端
- **React** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 原子化 CSS 框架
- **Zustand** - 轻量级状态管理

### 桌面端
- **Electron** - 跨平台桌面应用框架
- **Node.js** - 后端运行时

### 数据存储
- **SQLite** - 轻量级数据库
- **better-sqlite3** - SQLite 数据库驱动
- **Node.js Crypto** - 加密模块

### 构建工具
- **electron-builder** - 应用打包工具
- **React Scripts** - 开发和构建工具

## 🔒 安全架构

### 加密存储
```javascript
// API 密钥加密存储示例
const encryptedKey = encrypt(apiKey, masterKey);
// 存储: salt:iv:tag:encryptedData (Base64)
```

### 主密钥管理
- **macOS**: 使用 Keychain 存储主密钥
- **Windows**: 使用 DPAPI 加密主密钥
- **Linux**: 使用文件系统权限保护主密钥

### 进程间通信
- 使用 `contextBridge` 安全地暴露 API
- 禁用 `nodeIntegration` 和 `enableRemoteModule`
- 启用 `contextIsolation` 隔离上下文

## 📱 界面预览

### 主界面
- 清新的卡片式布局
- 直观的状态指示器
- 流畅的切换动画

### 添加/编辑界面
- 友好的表单验证
- 实时连接测试
- 安全的密钥输入

### 设置界面
- 分标签页的设置选项
- 完整的安全说明
- 数据导入导出功能

## 🛠️ 开发指南

### 添加新组件
```typescript
// 在 src/components/ 目录下创建新组件
import React from 'react';

interface NewComponentProps {
  // 定义属性类型
}

const NewComponent: React.FC<NewComponentProps> = (props) => {
  return (
    <div className="card">
      {/* 组件内容 */}
    </div>
  );
};

export default NewComponent;
```

### 使用状态管理
```typescript
import { useApiStore } from '../store/apiStore';

const Component = () => {
  const { sources, loadSources } = useApiStore();
  
  // 使用状态和方法
};
```

### 样式规范
- 使用 Tailwind CSS 类名
- 遵循小红书风格设计原则
- 使用预定义的组件类（如 `btn-primary`, `card`）

## 🔍 故障排除

### 常见问题

**问题**: Electron 无法启动
```bash
# 清除缓存并重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

**问题**: 数据库权限错误
```bash
# 检查用户主目录权限
ls -la ~/.claude-key-manager/
```

**问题**: 加密/解密失败
- 检查主密钥文件是否存在
- 确认文件权限设置正确
- 重置应用数据（将删除所有配置）

### 调试模式
```bash
# 启用详细日志
DEBUG=* npm run electron-dev
```

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add some amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📞 支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

- 📧 Email: support@claude-key-manager.com
- 💬 GitHub Issues: [提交问题](https://github.com/your-repo/claude-key-manager/issues)
- 📖 文档: [在线文档](https://docs.claude-key-manager.com)

---

**Built with ❤️ for Claude API users**
