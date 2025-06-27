import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-2xl shadow-md bg-white p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
