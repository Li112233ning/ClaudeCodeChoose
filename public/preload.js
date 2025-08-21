const { contextBridge, ipcRenderer } = require('electron');

// 通过 contextBridge 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // API 源管理
  getApiSources: () => ipcRenderer.invoke('get-api-sources'),
  saveApiSource: (sourceData) => ipcRenderer.invoke('save-api-source', sourceData),
  deleteApiSource: (sourceId) => ipcRenderer.invoke('delete-api-source', sourceId),
  switchApiSource: (sourceId) => ipcRenderer.invoke('switch-api-source', sourceId),
  testApiConnection: (sourceData) => ipcRenderer.invoke('test-api-connection', sourceData),
  
  // 安全相关
  lockApp: () => ipcRenderer.invoke('lock-app'),
  unlockApp: (password) => ipcRenderer.invoke('unlock-app', password),
  
  // 系统信息
  platform: process.platform,
  
  // 事件监听
  onApiSourceChanged: (callback) => {
    ipcRenderer.on('api-source-changed', callback);
    return () => ipcRenderer.removeListener('api-source-changed', callback);
  },
  
  onAppLocked: (callback) => {
    ipcRenderer.on('app-locked', callback);
    return () => ipcRenderer.removeListener('app-locked', callback);
  }
});

// 防止在渲染进程中访问 Node.js API
delete window.require;
delete window.exports;
delete window.module;
