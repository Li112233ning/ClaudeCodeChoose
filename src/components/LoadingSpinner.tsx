import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 border-neutral-200 border-t-primary-500 
          rounded-full animate-spin
        `}
      />
    </div>
  );
};

export default LoadingSpinner;
