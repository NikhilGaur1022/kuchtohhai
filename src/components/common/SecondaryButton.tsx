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
        return 'bg-white/80 backdrop-blur-sm text-dental-600 border border-white/20 hover:bg-white/90 shadow-glass hover:shadow-2xl';
      case 'outline':
        return 'bg-transparent text-dental-600 border-2 border-dental-600 hover:bg-dental-600 hover:text-white hover:shadow-lg';
      default:
        return 'bg-white text-dental-600 border border-dental-200 hover:bg-dental-50 hover:border-dental-300 shadow-md hover:shadow-xl';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        relative overflow-hidden px-6 py-3 rounded-xl font-medium
        transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-dental-100/0 before:via-dental-100/30 before:to-dental-100/0
        before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
        ${getVariantClasses()}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default SecondaryButton;