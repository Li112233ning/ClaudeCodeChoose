import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, TestTube, Check, AlertCircle, Info } from 'lucide-react';
import { ApiSource, useApiStore } from '../store/apiStore';
import LoadingSpinner from './LoadingSpinner';

interface AddSourceModalProps {
  source?: ApiSource | null;
  onClose: () => void;
  onSaved: () => void;
  onTestConnection: (success: boolean, message: string) => void;
}

const AddSourceModal: React.FC<AddSourceModalProps> = ({
  source,
  onClose,
  onSaved,
  onTestConnection
}) => {
  const { saveSource, testConnection } = useApiStore();
  
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    api_base: 'https://api.anthropic.com',
    is_default: false
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        apiKey: source.apiKey || '',
        api_base: source.api_base,
        is_default: source.is_default
      });
    }
  }, [source]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入源名称';
    }
    
    if (!formData.apiKey.trim()) {
      newErrors.apiKey = '请输入 API 密钥';
    } else if (!formData.apiKey.startsWith('sk-')) {
      newErrors.apiKey = 'API 密钥应以 "sk-" 开头';
    }
    
    if (!formData.api_base.trim()) {
      newErrors.api_base = '请输入 API 地址';
    } else {
      try {
        new URL(formData.api_base);
      } catch {
        newErrors.api_base = '请输入有效的 URL 地址';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const sourceData = {
        ...formData,
        id: source?.id
      };
      
      await saveSource(sourceData);
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsTesting(true);
      setTestResult(null);
      
      const result = await testConnection(formData);
      setTestResult(result);
      onTestConnection(result.success, result.message);
    } catch (error) {
      const errorResult = { success: false, message: '连接测试失败' };
      setTestResult(errorResult);
      onTestConnection(false, '连接测试失败');
    } finally {
      setIsTesting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setTestResult(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content max-w-lg">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-neutral-900">
            {source ? '编辑 API 源' : '添加 API 源'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 源名称 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              源名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="例如：Claude Official、自建代理等"
              className={`input-field ${errors.name ? 'ring-2 ring-red-300' : ''}`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* API 密钥 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              API 密钥 *
            </label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={formData.apiKey}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="sk-ant-api03-..."
                className={`input-field pr-12 ${errors.apiKey ? 'ring-2 ring-red-300' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4 text-neutral-500" />
                ) : (
                  <Eye className="w-4 h-4 text-neutral-500" />
                )}
              </button>
            </div>
            {errors.apiKey && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.apiKey}</span>
              </p>
            )}
          </div>

          {/* API 地址 */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              API 地址 *
            </label>
            <input
              type="url"
              value={formData.api_base}
              onChange={(e) => handleInputChange('api_base', e.target.value)}
              placeholder="https://api.anthropic.com"
              className={`input-field ${errors.api_base ? 'ring-2 ring-red-300' : ''}`}
            />
            {errors.api_base && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.api_base}</span>
              </p>
            )}
            <p className="mt-1 text-sm text-neutral-500 flex items-center space-x-1">
              <Info className="w-4 h-4" />
              <span>支持官方地址或自建反向代理地址</span>
            </p>
          </div>

          {/* 设为默认 */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => handleInputChange('is_default', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-300"
            />
            <label htmlFor="is_default" className="text-sm text-neutral-700">
              设为默认源（新用户首次使用时的默认选择）
            </label>
          </div>

          {/* 测试连接结果 */}
          {testResult && (
            <div className={`
              p-3 rounded-lg border flex items-center space-x-2
              ${testResult.success 
                ? 'bg-accent-50 border-accent-200 text-accent-800' 
                : 'bg-red-50 border-red-200 text-red-800'
              }
            `}>
              {testResult.success ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn-secondary flex items-center space-x-2"
            >
              {isTesting ? (
                <LoadingSpinner size="small" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              <span>测试连接</span>
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              取消
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2 flex-1"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{source ? '保存更改' : '添加源'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSourceModal;
