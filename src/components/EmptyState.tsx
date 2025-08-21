import React from 'react';
import { Plus, Key } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  actionText, 
  onAction 
}) => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        {/* 图标 */}
        <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Key className="w-10 h-10 text-neutral-400" />
        </div>
        
        {/* 标题 */}
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          {title}
        </h3>
        
        {/* 描述 */}
        <p className="text-neutral-600 mb-8">
          {description}
        </p>
        
        {/* 行动按钮 */}
        <button
          onClick={onAction}
          className="btn-primary flex items-center space-x-2 mx-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
        
        {/* 装饰性元素 */}
        <div className="mt-12 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
