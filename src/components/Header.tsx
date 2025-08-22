import React from 'react';
import { Plus, Settings, Shield, Zap } from 'lucide-react';
import { ApiSource } from '../store/apiStore';

interface HeaderProps {
  activeSource: ApiSource | null;
  onAddSource: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeSource, 
  onAddSource, 
  onOpenSettings 
}) => {
  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧：Logo 和标题 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-primary p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">
                  Claude Key Manager
                </h1>
              </div>
            </div>
          </div>

          {/* 中间：当前活跃源状态 */}
          <div className="hidden md:flex items-center space-x-4">
            {activeSource ? (
              <div className="flex items-center space-x-2 bg-accent-50 px-4 py-2 rounded-xl border border-accent-200">
                <Zap className="w-4 h-4 text-accent-600" />
                <span className="text-sm font-medium text-accent-800">
                  当前使用：{activeSource.name}
                </span>
                <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-neutral-100 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-neutral-400 rounded-full" />
                <span className="text-sm text-neutral-600">
                  未选择 API 源
                </span>
              </div>
            )}
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onAddSource}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">添加 API 源</span>
            </button>
            
            <button
              onClick={onOpenSettings}
              className="btn-secondary flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">设置</span>
            </button>
          </div>
        </div>

        {/* 移动端：当前活跃源状态 */}
        <div className="md:hidden mt-3">
          {activeSource ? (
            <div className="flex items-center space-x-2 bg-accent-50 px-3 py-2 rounded-lg border border-accent-200">
              <Zap className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-medium text-accent-800">
                当前使用：{activeSource.name}
              </span>
              <div className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center space-x-2 bg-neutral-100 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-neutral-400 rounded-full" />
              <span className="text-sm text-neutral-600">
                未选择 API 源
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
