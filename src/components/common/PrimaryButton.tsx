import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  className = '',
  disabled = false 
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-dental-600 text-white hover:bg-dental-700 px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export default PrimaryButton;;
