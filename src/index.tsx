import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// API 源接口
interface ApiSourceData {
  id?: number;
  name: string;
  apiKey: string;
  api_base: string;
  is_default: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// 声明全局的 electronAPI 类型
declare global {
  interface Window {
    electronAPI: {
      getApiSources: () => Promise<ApiSourceData[]>;
      saveApiSource: (sourceData: Partial<ApiSourceData>) => Promise<number | boolean>;
      deleteApiSource: (sourceId: number) => Promise<boolean>;
      switchApiSource: (sourceId: number) => Promise<{ success: boolean; message: string }>;
      testApiConnection: (sourceData: Partial<ApiSourceData>) => Promise<{ success: boolean; message: string }>;
      lockApp: () => Promise<void>;
      unlockApp: (password: string) => Promise<{ success: boolean }>;
      platform: string;
      onApiSourceChanged: (callback: (event: any, ...args: any[]) => void) => () => void;
      onAppLocked: (callback: (event: any, ...args: any[]) => void) => () => void;
    };
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
