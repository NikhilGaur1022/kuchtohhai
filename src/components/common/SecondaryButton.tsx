import React from 'react';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'default' | 'glass' | 'outline';
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  className = '',
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/80 backdrop-blur-sm text-dental-600 border border-white/20 hover:bg-white/90 shadow-glass';
      case 'outline':
        return 'bg-transparent text-dental-600 border-2 border-dental-600 hover:bg-dental-50';
      default:
        return 'bg-white text-dental-600 border border-dental-200 hover:bg-dental-50 shadow-md hover:shadow-lg';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        px-6 py-3 rounded-xl font-medium
        transition-all duration-300 transform hover:scale-105
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;