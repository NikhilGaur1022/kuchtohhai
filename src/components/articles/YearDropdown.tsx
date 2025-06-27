import React from 'react';

interface YearDropdownProps {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number | null) => void;
}

const YearDropdown: React.FC<YearDropdownProps> = ({ years, selectedYear, onChange }) => {
  return (
    <div className="mb-6 flex items-center gap-2">
      <label htmlFor="year-dropdown" className="text-sm font-medium text-neutral-700">Year:</label>
      <select
        id="year-dropdown"
        className="py-2 px-3 rounded-lg border border-neutral-300 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-dental-500 transition-colors duration-200 ease-in-out focus:border-dental-500 hover:border-dental-600"
        value={selectedYear ?? ''}
        onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All Years</option>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
};

export default YearDropdown;
