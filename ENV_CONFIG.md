# 环境配置说明

## 开发环境配置

在项目根目录创建 `.env` 文件，包含以下配置：

```bash
# 开发时不自动打开浏览器
BROWSER=none

# 生产构建时不生成 source map（减小文件大小）
GENERATE_SOURCEMAP=false

# Electron 开发模式标识
ELECTRON_IS_DEV=false

# React 应用配置
REACT_APP_VERSION=1.0.0
REACT_APP_NAME=claude-key-manager

# 可选：自定义端口（默认 3000）
# PORT=3000
```

## 生产环境配置

生产构建时，这些环境变量会被自动设置：

- `NODE_ENV=production`
- `GENERATE_SOURCEMAP=false`
- `ELECTRON_IS_DEV=false`

## 注意事项

1. `.env` 文件已添加到 `.gitignore`，不会被提交到版本控制
2. 敏感信息（如 API 密钥）不应该放在 `.env` 文件中
3. 应用内的 API 密钥通过加密存储在本地数据库中
