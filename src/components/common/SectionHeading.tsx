import React from 'react';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h1 className="text-4xl font-bold mb-2">{title}</h1>
    {subtitle && <p className="text-base text-neutral-600 mb-6">{subtitle}</p>}
  </div>
);

export default SectionHeading;
