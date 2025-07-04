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
        return 'bg-gradient-to-r from-dental-600 via-dental-700 to-dental-800 hover:from-dental-700 hover:via-dental-800 hover:to-dental-900 shadow-lg hover:shadow-2xl hover:shadow-dental-500/25';
      case 'glow':
        return 'bg-dental-600 hover:bg-dental-700 shadow-glow hover:shadow-glow-lg animate-pulse-glow';
      default:
        return 'bg-dental-600 hover:bg-dental-700 shadow-lg hover:shadow-2xl hover:shadow-dental-500/20';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden text-white px-6 py-3 rounded-xl font-medium
        transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
        disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0
        before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
        ${getVariantClasses()}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default PrimaryButton;