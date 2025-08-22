import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { X, Eye, EyeOff, Search, Check, AlertCircle, Info, ChevronDown } from 'lucide-react';
import { ApiSource, useApiStore, ModelInfo, QueryModelsResult } from '../store/apiStore';
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
  const { saveSource, queryModels } = useApiStore();
  
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    api_base: 'https://api.anthropic.com',
    model: '',
    is_default: false,
    is_active: false
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isQueryingModels, setIsQueryingModels] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryModelsResult | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name || '',
        apiKey: source.apiKey || '',
        api_base: source.api_base !== undefined && source.api_base !== null ? source.api_base : 'https://api.anthropic.com',
        model: source.model || '',
        is_default: source.is_default || false,
        is_active: source.is_active || false
      });
      
      // 如果已有模型选择，设置为已查询状态
      if (source.model) {
        setShowModelSelect(true);
        setAvailableModels([{
          id: source.model,
          name: source.model,
          displayName: source.model
        }]);
      }
    }
  }, [source]);

  const validateForm = (requireModel = true) => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = '请输入源名称';
    }
    
    if (!formData.apiKey || !formData.apiKey.trim()) {
      newErrors.apiKey = '请输入 API 密钥';
    } else if (!formData.apiKey.startsWith('sk-')) {
      newErrors.apiKey = 'API 密钥应以 "sk-" 开头';
    }
    
    if (!formData.api_base || !formData.api_base.trim()) {
      newErrors.api_base = '请输入 API 地址';
    } else {
      try {
        new URL(formData.api_base);
      } catch {
        newErrors.api_base = '请输入有效的 URL 地址';
      }
    }
    
    if (requireModel && showModelSelect && (!formData.model || !formData.model.trim())) {
      newErrors.model = '请选择一个模型';
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
        id: source?.id,
        is_active: source?.is_active ?? false
      };
      
      await saveSource(sourceData);
      onSaved();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryModels = async () => {
    // 直接设置查询结果为"暂未开启"
    const result: QueryModelsResult = {
      success: false,
      message: '暂未开启',
      models: []
    };

    setQueryResult(result);
    onTestConnection(false, '暂未开启');
    // if (!validateForm(false)) {
    //   return;
    // }
    //
    // try {
    //   setIsQueryingModels(true);
    //   setQueryResult(null);
    //   setAvailableModels([]);
    //   setShowModelSelect(false);
    //
    //   const result = await queryModels({
    //     ...formData,
    //     is_active: false
    //   });
    //
    //   setQueryResult(result);
    //
    //   if (result.success && result.models.length > 0) {
    //     setAvailableModels(result.models);
    //     setShowModelSelect(true);
    //
    //     // 如果只有一个模型，自动选择
    //     if (result.models.length === 1) {
    //       handleInputChange('model', result.models[0].id);
    //     }
    //   }
    //
    //   onTestConnection(result.success, result.message);
    // } catch (error) {
    //   const errorResult = { success: false, message: '查询模型失败', models: [] };
    //   setQueryResult(errorResult);
    //   onTestConnection(false, '查询模型失败');
    // } finally {
    //   setIsQueryingModels(false);
    // }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 当API地址或密钥改变时，重置模型选择状态
    if (field === 'api_base' || field === 'apiKey') {
      setQueryResult(null);
      setAvailableModels([]);
      setShowModelSelect(false);
      setFormData(prev => ({ ...prev, model: '' }));
    }
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

          {/* 模型选择 */}
          {showModelSelect && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                选择模型 *
              </label>
              <div className="relative">
                <select
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className={`input-field appearance-none pr-12 ${errors.model ? 'ring-2 ring-red-300' : ''}`}
                >
                  <option value="">请选择模型</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.displayName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              </div>
              {errors.model && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.model}</span>
                </p>
              )}
              <p className="mt-1 text-sm text-neutral-500 flex items-center space-x-1">
                <Info className="w-4 h-4" />
                <span>请先查询模型以获取可用列表</span>
              </p>
            </div>
          )}

          {/* 查询结果 */}
          {queryResult && (
            <div className={`
              p-3 rounded-lg border flex items-center space-x-2
              ${queryResult.success 
                ? 'bg-accent-50 border-accent-200 text-accent-800' 
                : 'bg-red-50 border-red-200 text-red-800'
              }
            `}>
              {queryResult.success ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{queryResult.message}</span>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleQueryModels}
              disabled={isQueryingModels}
              className="btn-secondary flex items-center space-x-2"
            >
              {isQueryingModels ? (
                <LoadingSpinner size="small" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>查询模型</span>
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
