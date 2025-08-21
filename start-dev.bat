@echo off
chcp 65001 >nul
echo ========================================
echo    Claude Key Manager - 开发环境启动
echo ========================================
echo.

echo 正在检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Node.js，请先安装 Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安装: 
    node --version
)

echo.
echo 正在检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: npm 不可用
    pause
    exit /b 1
) else (
    echo ✅ npm 已安装
)

echo.
echo 正在检查项目依赖...
if not exist "node_modules" (
    echo 📦 正在安装依赖包，这可能需要几分钟...
    npm install --silent
    if %errorlevel% neq 0 (
        echo ❌ 错误: 依赖安装失败
        echo 💡 尝试运行: npm install --verbose 查看详细错误信息
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装，检查是否需要更新...
    npm outdated >nul 2>&1
)

echo.
echo 🚀 启动开发环境...
echo.

echo 📊 1. 启动 React 开发服务器 (端口 3000)...
start "Claude Key Manager - React Dev Server" cmd /k "npm start"

echo ⏳ 2. 等待 React 服务器启动...
timeout /t 8 /nobreak >nul

echo 🖥️  3. 启动 Electron 应用...
start "Claude Key Manager - Electron App" cmd /k "npm run electron-dev"

echo.
echo ✅ 开发环境已启动！
echo.
echo 💡 使用说明:
echo    • React 开发服务器: http://localhost:3000
echo    • Electron 应用已自动打开
echo    • 修改代码会自动热重载
echo    • 在任一窗口按 Ctrl+C 可停止对应服务
echo    • 关闭 Electron 窗口会停止 Electron 进程
echo.
echo 📚 有用的命令:
echo    • npm run build      - 构建生产版本
echo    • npm run pack       - 打包应用（开发测试）
echo    • npm run dist       - 构建并打包发布版本
echo    • npm run clean      - 清理缓存文件
echo.
echo 🔧 如遇到问题，请查看 README.md 或 ENV_CONFIG.md
echo.
pause
