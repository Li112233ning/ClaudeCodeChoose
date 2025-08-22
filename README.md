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
