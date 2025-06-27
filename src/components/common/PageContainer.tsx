import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => (
  <div className={`container-custom max-w-7xl mx-auto px-4 py-8 ${className}`}>
    {children}
  </div>
);

export default PageContainer;
