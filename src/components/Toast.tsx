import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-accent-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-secondary-600" />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'toast-success border-accent-200 bg-accent-50';
      case 'error':
        return 'toast-error border-red-200 bg-red-50';
      case 'warning':
        return 'toast-warning border-secondary-200 bg-secondary-50';
    }
  };

  return (
    <div className={`toast ${getTypeClasses()} max-w-sm`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-900">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
