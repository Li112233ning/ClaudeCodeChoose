import React, { useEffect, useState } from 'react';
import { useApiStore, ApiSource } from './store/apiStore';
import Header from './components/Header';
import SourceList from './components/SourceList';
import AddSourceModal from './components/AddSourceModal';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

function App() {
  const { 
    sources, 
    activeSource, 
    isLoading, 
    error, 
    loadSources 
  } = useApiStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<ApiSource | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 加载数据
  useEffect(() => {
    loadSources();
  }, [loadSources]);

  // 显示错误消息
  useEffect(() => {
    if (error) {
      showToast('error', error);
    }
  }, [error]);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const id = Date.now().toString();
    const newToast: ToastMessage = { id, type, message };
    
    setToasts(prev => [...prev, newToast]);
    
    // 3秒后自动移除
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleAddSource = () => {
    setEditingSource(null);
    setShowAddModal(true);
  };

  const handleEditSource = (source: ApiSource) => {
    setEditingSource(source);
    setShowAddModal(true);
  };

  const handleSourceSaved = () => {
    setShowAddModal(false);
    setEditingSource(null);
    showToast('success', 'API 源已保存成功');
  };

  const handleSourceDeleted = () => {
    showToast('success', 'API 源已删除');
  };

  const handleSourceSwitched = (sourceName: string) => {
    showToast('success', `已切换到 ${sourceName}`);
  };

  const handleConnectionTested = (success: boolean, message: string) => {
    showToast(success ? 'success' : 'error', message);
  };

  if (isLoading && sources.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* 头部 */}
      <Header 
        activeSource={activeSource}
        onAddSource={handleAddSource}
      />

      {/* 主要内容区域 */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              API 源管理
            </h1>
            <p className="text-neutral-600">
              安全地管理您的 Claude API 密钥，支持多个来源动态切换
            </p>
          </div>

          {/* API 源列表 */}
          {sources.length === 0 ? (
            <EmptyState 
              title="还没有 API 源"
              description="添加您的第一个 Claude API 密钥开始使用"
              actionText="添加 API 源"
              onAction={handleAddSource}
            />
          ) : (
            <SourceList 
              sources={sources}
              activeSource={activeSource}
              onEdit={handleEditSource}
              onDelete={handleSourceDeleted}
              onSwitch={handleSourceSwitched}
              onTestConnection={handleConnectionTested}
            />
          )}
        </div>
      </main>

      {/* 模态框 */}
      {showAddModal && (
        <AddSourceModal
          source={editingSource}
          onClose={() => setShowAddModal(false)}
          onSaved={handleSourceSaved}
          onTestConnection={handleConnectionTested}
        />
      )}

      {/* Toast 通知 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* 全局加载指示器 */}
      {isLoading && sources.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-xl p-3 shadow-card border border-neutral-200">
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="small" />
              <span className="text-sm text-neutral-600">处理中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
