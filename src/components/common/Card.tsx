import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  glass = false 
}) => {
  const baseClasses = glass 
    ? 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-glass'
    : 'bg-white shadow-lg border border-neutral-100';
    
  const hoverClasses = hover 
    ? 'hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-500'
    : '';

  return (
    <div className={`rounded-2xl p-6 ${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;