@echo off
chcp 65001 >nul
echo ========================================
echo    Claude Key Manager - 项目安装
echo ========================================
echo.

echo 正在检查系统环境...
echo.

:: 检查 Node.js
echo 🔍 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js
    echo.
    echo 请先安装 Node.js (建议版本 16.0 或更高)
    echo 📥 下载地址: https://nodejs.org/
    echo.
    echo 安装完成后请重新运行此脚本
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js 已安装: %NODE_VERSION%
)

:: 检查 npm
echo 🔍 检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm 不可用
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm 已安装: %NPM_VERSION%
)

echo.
echo 🎯 开始安装项目依赖...
echo.

:: 清理可能的缓存问题
if exist "node_modules" (
    echo 🧹 发现已有 node_modules 目录，正在清理...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo 🧹 清理 package-lock.json...
    del package-lock.json
)

:: 清理 npm 缓存
echo 🧹 清理 npm 缓存...
npm cache clean --force >nul 2>&1

:: 安装依赖
echo 📦 安装项目依赖...
echo    这可能需要几分钟时间，请耐心等待...
echo.

npm install
if %errorlevel% neq 0 (
    echo.
    echo ❌ 依赖安装失败！
    echo.
    echo 💡 可能的解决方案：
    echo    1. 检查网络连接
    echo    2. 尝试使用国内镜像：npm config set registry https://registry.npmmirror.com
    echo    3. 清除 npm 缓存：npm cache clean --force
    echo    4. 删除 node_modules 文件夹后重试
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 依赖安装完成！
echo.

:: 验证关键依赖
echo 🔍 验证关键依赖...
npm list react >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告: React 未正确安装
) else (
    echo ✅ React 已安装
)

npm list electron >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告: Electron 未正确安装
) else (
    echo ✅ Electron 已安装
)

npm list tailwindcss >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  警告: Tailwind CSS 未正确安装
) else (
    echo ✅ Tailwind CSS 已安装
)

echo.
echo 🎉 安装完成！
echo.
echo 📋 接下来您可以：
echo.
echo   🚀 启动开发环境:
echo      双击 start-dev.bat 或运行 npm run dev
echo.
echo   🔨 构建生产版本:
echo      npm run build
echo.
echo   📦 打包应用:
echo      npm run pack    (开发测试用)
echo      npm run dist    (发布用)
echo.
echo   🧹 清理缓存:
echo      npm run clean
echo.
echo 📚 更多信息请查看 README.md
echo.
pause
