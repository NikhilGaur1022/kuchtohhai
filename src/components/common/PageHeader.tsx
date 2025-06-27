import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, children }) => (
  <section className="bg-dental-700 text-white pt-20 pb-8 px-4">
    <div className="container-custom mx-auto text-center">
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="text-base text-neutral-200 mb-4">{subtitle}</p>
      {children && <div className="mt-4 flex flex-col items-center justify-center gap-4">{children}</div>}
    </div>
  </section>
);

export default PageHeader;
