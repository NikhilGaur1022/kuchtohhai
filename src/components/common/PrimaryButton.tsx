import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'gradient' | 'glow';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  className = '',
  disabled = false,
  variant = 'default'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-dental-600 to-dental-700 hover:from-dental-700 hover:to-dental-800 shadow-lg hover:shadow-xl';
      case 'glow':
        return 'bg-dental-600 hover:bg-dental-700 shadow-glow hover:shadow-glow-lg';
      default:
        return 'bg-dental-600 hover:bg-dental-700 shadow-lg hover:shadow-xl';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        text-white px-6 py-3 rounded-xl font-medium
        transition-all duration-300 transform hover:scale-105
        disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;