import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    success: 'border-success',
    error: 'border-error',
    warning: 'border-warning',
    info: 'border-info'
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 dark:bg-darkgray/50 backdrop-blur-sm z-50">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 ${colorClasses[color]} mx-auto`}></div>
    </div>
  );
};

export default Loader; 