import React from 'react';

interface SecondaryButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ children, onClick, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`bg-white text-dental-600 border border-dental-600 hover:bg-dental-50 px-6 py-3 rounded-lg transition-colors duration-200 ${className}`}
  >
    {children}
  </button>
);

export default SecondaryButton;
