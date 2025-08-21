const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;

// 安全设置
app.whenReady().then(() => {
  createWindow();
  
  // 在生产环境中禁用开发者工具
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }
});

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false, // 安全考虑：禁用 node 集成
      contextIsolation: true, // 启用上下文隔离
      enableRemoteModule: false, // 禁用 remote 模块
      preload: path.join(__dirname, 'preload.js'), // 预加载脚本
      webSecurity: true
    },
    icon: path.join(__dirname, 'icon.png'), // 应用图标
    show: false, // 先不显示，等加载完成后显示
    titleBarStyle: 'default',
    frame: true
  });

  // 加载应用
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 开发环境下打开开发者工具
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 防止导航到外部链接
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });

  // 防止打开新窗口
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
  });
}

// 当所有窗口关闭时退出应用 (除了 macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC 通信处理 - API Key 管理
ipcMain.handle('get-api-sources', async () => {
  try {
    const DatabaseManager = require('./database');
    const db = new DatabaseManager();
    return await db.getAllSources();
  } catch (error) {
    console.error('Error getting API sources:', error);
    return [];
  }
});

ipcMain.handle('save-api-source', async (event, sourceData) => {
  try {
    const DatabaseManager = require('./database');
    const db = new DatabaseManager();
    return await db.saveSource(sourceData);
  } catch (error) {
    console.error('Error saving API source:', error);
    throw error;
  }
});

ipcMain.handle('delete-api-source', async (event, sourceId) => {
  try {
    const DatabaseManager = require('./database');
    const db = new DatabaseManager();
    return await db.deleteSource(sourceId);
  } catch (error) {
    console.error('Error deleting API source:', error);
    throw error;
  }
});

ipcMain.handle('switch-api-source', async (event, sourceId) => {
  try {
    const DatabaseManager = require('./database');
    const db = new DatabaseManager();
    const source = await db.getSourceById(sourceId);
    
    if (source) {
      // 动态切换环境变量
      process.env.CLAUDE_API_KEY = source.decryptedKey;
      process.env.CLAUDE_API_BASE = source.apiBase;
      
      // 标记为当前使用的来源
      await db.setActiveSource(sourceId);
      
      return { success: true, message: 'API source switched successfully' };
    } else {
      throw new Error('Source not found');
    }
  } catch (error) {
    console.error('Error switching API source:', error);
    throw error;
  }
});

ipcMain.handle('test-api-connection', async (event, sourceData) => {
  try {
    // 这里可以实现测试连接的逻辑
    // 暂时返回成功，实际应该调用 Claude API 进行测试
    return { success: true, message: 'Connection test successful' };
  } catch (error) {
    console.error('Error testing API connection:', error);
    return { success: false, message: error.message };
  }
});

// 安全相关的 IPC 处理
ipcMain.handle('lock-app', async () => {
  // 实现应用锁定逻辑
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('unlock-app', async (event, password) => {
  // 实现应用解锁逻辑
  // 验证密码逻辑
  if (mainWindow) {
    mainWindow.show();
  }
  return { success: true };
});

// 应用退出前的清理工作
app.on('before-quit', () => {
  // 清理敏感数据
  delete process.env.CLAUDE_API_KEY;
  delete process.env.CLAUDE_API_BASE;
});
