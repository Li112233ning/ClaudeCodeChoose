import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Power, 
  PowerOff, 
  TestTube, 
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import { ApiSource, useApiStore } from '../store/apiStore';
import LoadingSpinner from './LoadingSpinner';

interface SourceListProps {
  sources: ApiSource[];
  activeSource: ApiSource | null;
  onEdit: (source: ApiSource) => void;
  onDelete: () => void;
  onSwitch: (sourceName: string) => void;
  onTestConnection: (success: boolean, message: string) => void;
}

const SourceList: React.FC<SourceListProps> = ({
  sources,
  activeSource,
  onEdit,
  onDelete,
  onSwitch,
  onTestConnection
}) => {

  const { deleteSource, switchToSource, testConnection } = useApiStore();
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: string }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; source: ApiSource | null }>({ 
    show: false, 
    source: null 
  });

  const setLoading = (sourceId: number, action: string) => {
    setLoadingStates(prev => ({ ...prev, [sourceId]: action }));
  };

  const clearLoading = (sourceId: number) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[sourceId];
      return newState;
    });
  };

  const handleDelete = (source: ApiSource) => {
    setDeleteConfirm({ show: true, source });
  };

  const confirmDelete = async () => {
    const source = deleteConfirm.source;
    if (!source?.id) return;
    
    try {
      setLoading(source.id, 'deleting');
      await deleteSource(source.id);
      onDelete();
      setDeleteConfirm({ show: false, source: null });
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      clearLoading(source.id);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, source: null });
  };

  const handleSwitch = async (source: ApiSource) => {
    if (!source.id) return;
    
    try {
      setLoading(source.id, 'switching');
      await switchToSource(source.id);
      onSwitch(source.name);
    } catch (error) {
      console.error('Switch failed:', error);
    } finally {
      clearLoading(source.id);
    }
  };

  const handleTestConnection = async (source: ApiSource) => {
    if (!source.id) return;
    
    try {
      setLoading(source.id, 'testing');
      const result = await testConnection(source);
      onTestConnection(result.success, result.message);
    } catch (error) {
      console.error('Test failed:', error);
      onTestConnection(false, '连接测试失败');
    } finally {
      clearLoading(source.id);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => {
          const isActive = source.is_active;
          const loadingAction = source.id ? loadingStates[source.id] : null;
          
          return (
            <div
              key={source.id}
              className={`
                card card-hover relative overflow-hidden
                ${isActive ? 'ring-2 ring-primary-300 bg-primary-50' : ''}
              `}
            >
              {/* 活跃状态指示器 */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
              )}

              {/* 卡片头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 truncate">
                    {source.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {isActive ? (
                      <span className="status-active">当前使用</span>
                    ) : (
                      <span className="status-inactive">未使用</span>
                    )}
                    {source.is_default && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                        默认
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={() => onEdit(source)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4 text-neutral-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(source)}
                    className={`
                      p-2 rounded-lg transition-all duration-200
                      ${!!loadingAction 
                        ? 'bg-neutral-100 cursor-not-allowed' 
                        : 'hover:bg-red-50 hover:scale-105 active:scale-95'
                      }
                    `}
                    title="删除"
                    disabled={!!loadingAction}
                  >
                    {loadingAction === 'deleting' ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <Trash2 className={`
                        w-4 h-4 transition-colors
                        ${!!loadingAction ? 'text-neutral-400' : 'text-red-500 hover:text-red-600'}
                      `} />
                    )}
                  </button>
                </div>
              </div>

              {/* API 信息 */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    API 地址
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-neutral-100 px-2 py-1 rounded flex-1 truncate">
                      {source.api_base || '无API地址'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(source.api_base, `${source.id}-base`)}
                      className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      title="复制地址"
                    >
                      {copiedField === `${source.id}-base` ? (
                        <Check className="w-3 h-3 text-accent-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                    API 密钥
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-neutral-100 px-2 py-1 rounded flex-1">
                      sk-****{source.apiKey?.slice(-4) || '****'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(source.apiKey, `${source.id}-key`)}
                      className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      title="复制密钥"
                    >
                      {copiedField === `${source.id}-key` ? (
                        <Check className="w-3 h-3 text-accent-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              {source.created_at && (
                <div className="text-xs text-neutral-500 mb-4">
                  创建于 {formatDate(source.created_at)}
                </div>
              )}

              {/* 操作按钮组 */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSwitch(source)}
                  disabled={isActive || !!loadingAction}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all
                    ${isActive 
                      ? 'bg-accent-100 text-accent-700 cursor-not-allowed' 
                      : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
                    }
                  `}
                >
                  {loadingAction === 'switching' ? (
                    <LoadingSpinner size="small" />
                  ) : isActive ? (
                    <>
                      <Power className="w-4 h-4" />
                      <span>使用中</span>
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-4 h-4" />
                      <span>切换使用</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleTestConnection(source)}
                  disabled={!!loadingAction}
                  className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg font-medium hover:bg-secondary-200 transition-colors flex items-center space-x-2"
                  title="测试连接"
                >
                  {loadingAction === 'testing' ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 删除确认模态框 */}
      {deleteConfirm.show && deleteConfirm.source && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">确认删除</h2>
              </div>
              <button
                onClick={cancelDelete}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* 内容 */}
            <div className="mb-6">
              <p className="text-neutral-700 mb-4">
                您确定要删除 API 源 <strong>"{deleteConfirm.source.name}"</strong> 吗？
              </p>
            </div>

            {/* 按钮组 */}
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                disabled={loadingStates[deleteConfirm.source.id!] === 'deleting'}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loadingStates[deleteConfirm.source.id!] === 'deleting' ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>删除中...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>确认删除</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SourceList;
