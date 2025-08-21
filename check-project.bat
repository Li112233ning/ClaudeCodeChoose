@echo off
chcp 65001 >nul
echo ========================================
echo    Claude Key Manager - 项目检查
echo ========================================
echo.

echo 🔍 正在检查项目完整性...
echo.

:: 检查必要文件
echo 📁 检查关键文件:
set "files=package.json src\index.tsx src\App.tsx public\main.js public\preload.js tailwind.config.js tsconfig.json"
for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ %%f
    ) else (
        echo ❌ %%f - 缺失
        set "missing=true"
    )
)

echo.
echo 📁 检查目录结构:
set "dirs=src src\components src\store public"
for %%d in (%dirs%) do (
    if exist "%%d" (
        echo ✅ %%d\
    ) else (
        echo ❌ %%d\ - 缺失
        set "missing=true"
    )
)

echo.
echo 📦 检查依赖安装:
if exist "node_modules" (
    echo ✅ node_modules 目录存在
    
    :: 检查关键依赖
    if exist "node_modules\react" (
        echo ✅ React 已安装
    ) else (
        echo ❌ React 未安装
        set "deps_missing=true"
    )
    
    if exist "node_modules\electron" (
        echo ✅ Electron 已安装
    ) else (
        echo ❌ Electron 未安装
        set "deps_missing=true"
    )
    
    if exist "node_modules\tailwindcss" (
        echo ✅ Tailwind CSS 已安装
    ) else (
        echo ❌ Tailwind CSS 未安装
        set "deps_missing=true"
    )
    
    if exist "node_modules\typescript" (
        echo ✅ TypeScript 已安装
    ) else (
        echo ❌ TypeScript 未安装
        set "deps_missing=true"
    )
) else (
    echo ❌ node_modules 目录不存在
    set "deps_missing=true"
)

echo.
echo 🔧 检查配置文件内容:

:: 检查 package.json
if exist "package.json" (
    findstr /c:"react-scripts" package.json >nul
    if %errorlevel% equ 0 (
        echo ✅ package.json 包含 react-scripts
    ) else (
        echo ❌ package.json 缺少 react-scripts
        set "config_issue=true"
    )
    
    findstr /c:"electron" package.json >nul
    if %errorlevel% equ 0 (
        echo ✅ package.json 包含 electron
    ) else (
        echo ❌ package.json 缺少 electron
        set "config_issue=true"
    )
)

:: 检查 TypeScript 配置
if exist "tsconfig.json" (
    findstr /c:"react-jsx" tsconfig.json >nul
    if %errorlevel% equ 0 (
        echo ✅ tsconfig.json 配置正确
    ) else (
        echo ⚠️  tsconfig.json 可能需要检查
    )
)

echo.
echo 📊 检查结果总结:
echo.

if defined missing (
    echo ❌ 项目文件不完整
    echo    请确保所有必要文件都存在
    set "overall_status=failed"
) else (
    echo ✅ 项目文件完整
)

if defined deps_missing (
    echo ❌ 依赖未正确安装
    echo    运行 install.bat 或 npm install 安装依赖
    set "overall_status=failed"
) else (
    echo ✅ 依赖安装正确
)

if defined config_issue (
    echo ⚠️  配置文件可能有问题
    echo    请检查 package.json 和相关配置
    set "overall_status=warning"
)

echo.
if "%overall_status%"=="failed" (
    echo 🚨 项目检查失败
    echo.
    echo 💡 建议操作:
    echo    1. 运行 install.bat 安装依赖
    echo    2. 检查文件是否完整下载
    echo    3. 查看 README.md 获取帮助
) else if "%overall_status%"=="warning" (
    echo ⚠️  项目基本正常，但有警告
    echo.
    echo 💡 可以尝试启动项目，如有问题请检查配置
) else (
    echo 🎉 项目检查通过！
    echo.
    echo 🚀 您可以运行以下命令:
    echo    • start-dev.bat      - 启动开发环境
    echo    • npm run build      - 构建项目
    echo    • npm run pack       - 打包应用
)

echo.
pause
