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
      preload: isDev 
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, 'preload.js'), // 预加载脚本
      webSecurity: true
    },
    icon: path.join(__dirname, 'icon.png'), // 应用图标
    show: false, // 先不显示，等加载完成后显示
    titleBarStyle: 'default',
    frame: true
  });

  // 加载应用
  let startUrl;
  if (isDev) {
    startUrl = 'http://localhost:3000';
  } else {
    // 生产环境：检查多个可能的路径
    const possiblePaths = [
      path.join(__dirname, '../build/index.html'),
      path.join(__dirname, '../../build/index.html'),
      path.join(process.resourcesPath, 'build/index.html'),
      path.join(__dirname, 'build/index.html')
    ];
    
    const fs = require('fs');
    let indexPath = null;
    
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        indexPath = possiblePath;
        console.log('Found index.html at:', indexPath);
        break;
      }
    }
    
    if (!indexPath) {
      console.error('Could not find index.html in any of the expected locations:', possiblePaths);
      // 作为备用，尝试使用第一个路径
      indexPath = possiblePaths[0];
    }
    
    startUrl = `file://${indexPath}`;
  }
  
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
      // 设置当前进程的环境变量（用于当前应用）
      process.env.CLAUDE_API_KEY = source.decryptedKey;
      process.env.CLAUDE_API_BASE = source.api_base;
      
      // 设置Claude Code使用的环境变量
      process.env.ANTHROPIC_AUTH_TOKEN = source.decryptedKey;
      process.env.ANTHROPIC_BASE_URL = source.api_base;
      
      if (source.model) {
        process.env.CLAUDE_MODEL = source.model;
        process.env.ANTHROPIC_MODEL = source.model;
      }
      
      // 设置系统级环境变量（用于Claude Code等外部应用）
      await setSystemEnvironmentVariables(source);
      
      // 标记为当前使用的来源
      await db.setActiveSource(sourceId);
      
      return { success: true, message: 'API source switched successfully. 请重启Claude Code以使新配置生效。' };
    } else {
      throw new Error('Source not found');
    }
  } catch (error) {
    console.error('Error switching API source:', error);
    throw error;
  }
});

// 设置系统级环境变量的函数
async function setSystemEnvironmentVariables(source) {
  const { spawn } = require('child_process');
  const os = require('os');
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    if (os.platform() === 'win32') {
      // Windows: 使用 setx 命令设置用户级环境变量
      const commands = [
        ['setx', ['ANTHROPIC_AUTH_TOKEN', source.decryptedKey]],
        ['setx', ['ANTHROPIC_BASE_URL', source.api_base]]
      ];
      
      if (source.model) {
        commands.push(['setx', ['ANTHROPIC_MODEL', source.model]]);
      }
      
      for (const [cmd, args] of commands) {
        console.log(`执行命令: ${cmd} ${args.join(' ')}`);
        await new Promise((resolve, reject) => {
          const proc = spawn(cmd, args, { 
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            encoding: 'utf8'
          });
          
          let stdout = '';
          let stderr = '';
          
          proc.stdout?.on('data', (data) => {
            // 尝试正确解码中文输出
            try {
              stdout += data.toString('utf8');
            } catch (e) {
              stdout += data.toString();
            }
          });
          
          proc.stderr?.on('data', (data) => {
            try {
              stderr += data.toString('utf8');
            } catch (e) {
              stderr += data.toString();
            }
          });
          
          proc.on('close', (code) => {
            // 简化日志输出，避免显示乱码
            if (code === 0) {
              console.log(`✅ 成功设置环境变量: ${args[0]}=${args[1]}`);
              resolve();
            } else {
              console.error(`❌ 设置环境变量失败: ${args[0]}, 错误代码: ${code}`);
              if (stderr.trim()) {
                console.error(`错误信息: ${stderr.trim()}`);
              }
              reject(new Error(`setx failed with code ${code}`));
            }
          });
          
          proc.on('error', (error) => {
            console.error(`❌ 执行setx命令失败: ${cmd}`, error.message);
            reject(error);
          });
        });
      }
      
      console.log('✅ Windows环境变量设置完成');
      
    } else {
      // Unix/Linux/macOS: 写入到 shell 配置文件
      const homeDir = os.homedir();
      const shellFiles = [
        path.join(homeDir, '.bashrc'),
        path.join(homeDir, '.zshrc'),
        path.join(homeDir, '.profile')
      ];
      
      const envVars = [
        `export ANTHROPIC_AUTH_TOKEN="${source.decryptedKey}"`,
        `export ANTHROPIC_BASE_URL="${source.api_base}"`
      ];
      
      if (source.model) {
        envVars.push(`export ANTHROPIC_MODEL="${source.model}"`);
      }
      
      for (const shellFile of shellFiles) {
        try {
          const stats = await fs.stat(shellFile);
          if (stats.isFile()) {
            let content = await fs.readFile(shellFile, 'utf8');
            
            // 移除旧的 Anthropic 环境变量
            content = content.replace(/^export ANTHROPIC_AUTH_TOKEN=.*$/gm, '');
            content = content.replace(/^export ANTHROPIC_BASE_URL=.*$/gm, '');
            content = content.replace(/^export ANTHROPIC_MODEL=.*$/gm, '');
            
            // 添加新的环境变量
            content += '\n\n# Claude API Configuration (auto-generated)\n';
            content += envVars.join('\n') + '\n';
            
            await fs.writeFile(shellFile, content);
            console.log(`已更新 ${shellFile}`);
          }
        } catch (err) {
          // 文件不存在或无法读取，跳过
          continue;
        }
      }
    }
    
    // 同时写入一个专用的配置文件（如果Claude Code支持的话）
    await writeClaudeConfigFile(source);
    
  } catch (error) {
    console.error('设置系统环境变量失败:', error);
    // 不抛出错误，因为进程级环境变量已经设置了
  }
}

// 写入Claude专用配置文件
async function writeClaudeConfigFile(source) {
  const fs = require('fs').promises;
  const path = require('path');
  const os = require('os');
  
  try {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.claude');
    const configFile = path.join(configDir, 'config.json');
    
    // 创建配置目录
    await fs.mkdir(configDir, { recursive: true });
    
    // 写入配置文件
    const config = {
      apiKey: source.decryptedKey,
      apiBase: source.api_base,
      model: source.model || 'claude-3-5-sonnet-20241022',
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(configFile, JSON.stringify(config, null, 2));
    console.log(`已更新 Claude 配置文件: ${configFile}`);
    
    // 同时创建一个 .env 格式的文件
    const envFile = path.join(configDir, 'claude.env');
    const envContent = [
      `ANTHROPIC_AUTH_TOKEN=${source.decryptedKey}`,
      `ANTHROPIC_BASE_URL=${source.api_base}`,
      source.model ? `ANTHROPIC_MODEL=${source.model}` : '',
      `# Last updated: ${new Date().toISOString()}`
    ].filter(Boolean).join('\n');
    
    await fs.writeFile(envFile, envContent);
    console.log(`已更新 Claude 环境文件: ${envFile}`);
    
  } catch (error) {
    console.error('写入Claude配置文件失败:', error);
  }
}

ipcMain.handle('query-models', async (event, sourceData) => {
  try {
    const { apiKey, api_base } = sourceData;
    
    if (!apiKey || !api_base) {
      return { success: false, message: '缺少API密钥或地址', models: [] };
    }

    // 构建API请求URL
    const apiUrl = api_base.endsWith('/') ? api_base + 'v1/models' : api_base + '/v1/models';
    console.log('查询模型URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-Key-Manager/1.0.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', response.status, errorText);
      
      if (response.status === 401) {
        return { success: false, message: 'API密钥无效或权限不足', models: [] };
      } else if (response.status === 403) {
        return { success: false, message: 'API密钥权限不足', models: [] };
      } else if (response.status === 404) {
        return { success: false, message: 'API地址无效或不支持模型查询', models: [] };
      } else {
        return { success: false, message: `API调用失败: ${response.status}`, models: [] };
      }
    }

    const data = await response.json();
    console.log('API返回的原始数据:', JSON.stringify(data, null, 2));
    
    // 尝试多种可能的数据结构
    let models = [];
    if (data.data && Array.isArray(data.data)) {
      models = data.data;
    } else if (data.models && Array.isArray(data.models)) {
      models = data.models;
    } else if (Array.isArray(data)) {
      models = data;
    } else if (data.object === 'list' && data.data) {
      models = data.data;
    }
    
    console.log('解析出的模型数组:', models);
    
    if (!Array.isArray(models) || models.length === 0) {
      console.log('没有找到模型数组');
      return { 
        success: true, 
        message: '连接成功，但未找到模型数据', 
        models: []
      };
    }
    
    // 先显示所有模型信息用于调试
    console.log('所有可用模型:', models.map(m => ({ id: m.id, name: m.name || m.id })));
    
    // 显示所有模型，不进行过滤（用于调试）
    const allModels = models.map(model => ({
      id: model.id,
      name: model.id,
      displayName: getModelDisplayName(model.id)
    }));
    
    console.log('过滤后的模型:', allModels);
    
    if (allModels.length === 0) {
      console.log('过滤后没有模型');
      return { 
        success: true, 
        message: '连接成功，但过滤后没有找到可用模型', 
        models: []
      };
    }
    
    return { 
      success: true, 
      message: `连接成功，找到 ${allModels.length} 个可用模型`, 
      models: allModels 
    };
    
  } catch (error) {
    console.error('查询模型失败:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return { success: false, message: '无法连接到API服务器，请检查网络连接和API地址', models: [] };
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { success: false, message: 'API请求失败，请检查API地址格式', models: [] };
    } else {
      return { success: false, message: `查询模型失败: ${error.message}`, models: [] };
    }
  }
});

// 验证环境变量设置的IPC处理
ipcMain.handle('verify-environment-variables', async () => {
  const { spawn } = require('child_process');
  const os = require('os');
  
  try {
    if (os.platform() === 'win32') {
      // Windows: 使用PowerShell读取用户环境变量
      const psCommand = `
        $token = [Environment]::GetEnvironmentVariable('ANTHROPIC_AUTH_TOKEN', 'User')
        $baseUrl = [Environment]::GetEnvironmentVariable('ANTHROPIC_BASE_URL', 'User')
        $model = [Environment]::GetEnvironmentVariable('ANTHROPIC_MODEL', 'User')
        Write-Output "TOKEN:$token"
        Write-Output "BASE_URL:$baseUrl"
        Write-Output "MODEL:$model"
      `;
      
      return new Promise((resolve) => {
        const proc = spawn('powershell', ['-Command', psCommand], { 
          shell: true,
          stdio: ['ignore', 'pipe', 'pipe'],
          encoding: 'utf8'
        });
        
        let stdout = '';
        let stderr = '';
        
        proc.stdout?.on('data', (data) => {
          try {
            stdout += data.toString('utf8');
          } catch (e) {
            stdout += data.toString();
          }
        });
        
        proc.stderr?.on('data', (data) => {
          try {
            stderr += data.toString('utf8');
          } catch (e) {
            stderr += data.toString();
          }
        });
        
        proc.on('close', (code) => {
          console.log('✅ 环境变量验证完成');
          
          const lines = stdout.split('\n');
          const result = {
            success: code === 0,
            variables: {},
            error: stderr
          };
          
          lines.forEach(line => {
            if (line.startsWith('TOKEN:')) {
              const value = line.substring(6).trim();
              result.variables.ANTHROPIC_AUTH_TOKEN = value || null;
              if (value) console.log(`ANTHROPIC_AUTH_TOKEN: ${value.substring(0, 10)}...`);
            } else if (line.startsWith('BASE_URL:')) {
              const value = line.substring(9).trim();
              result.variables.ANTHROPIC_BASE_URL = value || null;
              if (value) console.log(`ANTHROPIC_BASE_URL: ${value}`);
            } else if (line.startsWith('MODEL:')) {
              const value = line.substring(6).trim();
              result.variables.ANTHROPIC_MODEL = value || null;
              if (value) console.log(`ANTHROPIC_MODEL: ${value}`);
            }
          });
          
          resolve(result);
        });
        
        proc.on('error', (error) => {
          console.error('❌ 验证环境变量失败:', error.message);
          resolve({
            success: false,
            variables: {},
            error: error.message
          });
        });
      });
      
    } else {
      // Unix/Linux/macOS: 读取进程环境变量
      return {
        success: true,
        variables: {
          ANTHROPIC_AUTH_TOKEN: process.env.ANTHROPIC_AUTH_TOKEN || null,
          ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || null,
          ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || null
        }
      };
    }
  } catch (error) {
    console.error('验证环境变量失败:', error);
    return {
      success: false,
      variables: {},
      error: error.message
    };
  }
});

// 获取模型显示名称的辅助函数
function getModelDisplayName(modelId) {
  if (!modelId) return 'Unknown Model';
  
  const displayNames = {
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
    'claude-3-sonnet-20240229': 'Claude 3 Sonnet',
    'claude-3-haiku-20240307': 'Claude 3 Haiku',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-2.1': 'Claude 2.1',
    'claude-2.0': 'Claude 2.0',
    'claude-instant-1.2': 'Claude Instant 1.2'
  };
  
  // 如果有完全匹配的显示名称，使用它
  if (displayNames[modelId]) {
    return displayNames[modelId];
  }
  
  // 否则尝试从模型ID中提取更友好的名称
  let displayName = modelId;
  
  // 首字母大写，替换连字符为空格
  displayName = modelId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return displayName;
}

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
  delete process.env.CLAUDE_MODEL;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.ANTHROPIC_BASE_URL;
  delete process.env.ANTHROPIC_MODEL;
});
