#!/bin/bash

echo "========================================"
echo "   Claude Key Manager - 开发环境启动"
echo "========================================"
echo

# 检查 Node.js
echo "正在检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "错误: 未检测到 Node.js，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "Node.js 版本: $(node --version)"

# 检查依赖
echo "正在检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
fi

echo
echo "启动开发环境..."
echo

# 启动 React 开发服务器（后台运行）
echo "1. 启动 React 开发服务器 (端口 3000)..."
npm start &
REACT_PID=$!

# 等待 React 服务器启动
echo "2. 等待 React 服务器启动..."
sleep 5

# 启动 Electron 应用
echo "3. 启动 Electron 应用..."
npm run electron-dev &
ELECTRON_PID=$!

echo
echo "开发环境已启动！"
echo
echo "提示:"
echo "- React 服务器运行在 http://localhost:3000"
echo "- Electron 应用已自动打开" 
echo "- 修改代码会自动重新加载"
echo "- 按 Ctrl+C 可停止所有服务"
echo

# 等待用户中断
trap "echo '正在停止服务...'; kill $REACT_PID $ELECTRON_PID 2>/dev/null; exit" INT

# 保持脚本运行
wait
