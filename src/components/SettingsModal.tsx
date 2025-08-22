import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Palette, 
  Download, 
  Upload, 
  Info, 
  Github, 
  Lock,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'about'>('general');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [autoLock, setAutoLock] = useState(false);
  const [lockTimeout, setLockTimeout] = useState(30);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleExportData = () => {
    // 实现数据导出逻辑
    console.log('Exporting data...');
  };

  const handleImportData = () => {
    // 实现数据导入逻辑
    console.log('Importing data...');
  };

  const tabs = [
    { id: 'general', label: '常规', icon: Palette },
    { id: 'security', label: '安全', icon: Shield },
    { id: 'about', label: '关于', icon: Info }
  ] as const;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content max-w-2xl">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">设置</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="flex border-b border-neutral-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 标签页内容 */}
        <div className="min-h-[400px]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">常规设置</h3>
              
              {/* 主题设置 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">
                  外观主题
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: '浅色', icon: Sun },
                    { value: 'dark', label: '深色', icon: Moon },
                    { value: 'system', label: '跟随系统', icon: Monitor }
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value as any)}
                        className={`
                          flex flex-col items-center space-y-2 p-4 rounded-xl border-2 transition-all
                          ${theme === option.value
                            ? 'border-primary-300 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                          }
                        `}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 数据管理 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">
                  数据管理
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportData}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>导出配置</span>
                  </button>
                  <button
                    onClick={handleImportData}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>导入配置</span>
                  </button>
                </div>
                <p className="text-sm text-neutral-500">
                  配置数据将以加密形式导出，可在其他设备上导入使用。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">安全设置</h3>
              
              {/* 自动锁定 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">
                      自动锁定应用
                    </label>
                    <p className="text-sm text-neutral-500">
                      在指定时间无操作后自动锁定应用
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoLock}
                    onChange={(e) => setAutoLock(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-300"
                  />
                </div>
                
                {autoLock && (
                  <div className="ml-6 space-y-2">
                    <label className="block text-sm font-medium text-neutral-700">
                      锁定超时时间（分钟）
                    </label>
                    <select
                      value={lockTimeout}
                      onChange={(e) => setLockTimeout(Number(e.target.value))}
                      className="input-field w-32"
                    >
                      <option value={5}>5 分钟</option>
                      <option value={15}>15 分钟</option>
                      <option value={30}>30 分钟</option>
                      <option value={60}>1 小时</option>
                    </select>
                  </div>
                )}
              </div>

              {/* 安全信息 */}
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-accent-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-accent-800">
                      数据安全保护
                    </h4>
                    <ul className="text-sm text-accent-700 space-y-1">
                      <li>• API 密钥使用 AES-256-GCM 加密存储</li>
                      <li>• 主密钥存储在系统安全密钥链中</li>
                      <li>• 内存中的敏感数据及时清除</li>
                      <li>• 禁用了 Node.js 集成以防止 XSS 攻击</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 立即锁定按钮 */}
              <div className="space-y-3">
                <button className="btn-secondary flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>立即锁定应用</span>
                </button>
                <p className="text-sm text-neutral-500">
                  锁定后需要密码才能重新使用应用。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">关于应用</h3>
              
              {/* 应用信息 */}
              <div className="text-center py-8">
                <div className="bg-gradient-primary p-4 rounded-xl w-16 h-16 mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-neutral-900 mb-2">
                  Claude Key Manager
                </h4>
                <p className="text-neutral-600 mb-1">版本 1.0.0</p>
                <p className="text-sm text-neutral-500">
                  安全 · 简洁 · 高效的 API 密钥管理工具
                </p>
              </div>

              {/* 特性列表 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium text-neutral-900">核心特性</h5>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• 多 API 源管理</li>
                    <li>• 动态来源切换</li>
                    <li>• 加密安全存储</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5 className="font-medium text-neutral-900">技术栈</h5>
                  <ul className="text-sm text-neutral-600 space-y-1">
                    <li>• Electron + React</li>
                    <li>• TypeScript + Tailwind CSS</li>
                    <li>• SQLite + Zustand</li>
                  </ul>
                </div>
              </div>

              {/* 开源信息 */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Github className="w-5 h-5 text-neutral-600" />
                  <h5 className="font-medium text-neutral-900">开源项目</h5>
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  本项目采用 MIT 许可证开源，欢迎贡献代码和反馈问题。
                </p>
                <button className="btn-secondary text-sm">
                  查看源代码
                </button>
              </div>

              {/* 版权信息 */}
              <div className="text-center text-sm text-neutral-500">
                <p>© 2024 CC Key Manager. All rights reserved.</p>
                <p className="mt-1">
                  Built with ❤️ for Claude API users
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end pt-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
