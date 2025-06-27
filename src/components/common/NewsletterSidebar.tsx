import React, { useState } from 'react';
import Card from './Card';

const mockNewsletters = [
  {
    title: 'Digital Dentistry Trends',
    issueNumber: '01',
    publishDate: '2025-01-15',
    downloadLink: '#',
  },
  {
    title: 'Implantology Insights',
    issueNumber: '02',
    publishDate: '2025-02-15',
    downloadLink: '#',
  },
  {
    title: 'Practice Management Special',
    issueNumber: '03',
    publishDate: '2025-03-15',
    downloadLink: '#',
  },
  {
    title: 'Pediatric Dentistry Focus',
    issueNumber: '04',
    publishDate: '2025-04-15',
    downloadLink: '#',
  },
  {
    title: 'Aesthetic Innovations',
    issueNumber: '05',
    publishDate: '2025-05-15',
    downloadLink: '#',
  },
];

interface NewsletterSidebarProps {
  onSelect: (newsletter: typeof mockNewsletters[0]) => void;
  selected: typeof mockNewsletters[0] | null;
}

const NewsletterSidebar: React.FC<NewsletterSidebarProps> = ({ onSelect, selected }) => {
  const [open, setOpen] = useState(false);

  return (
    <aside className="w-full md:w-72 md:block">
      {/* Mobile toggle */}
      <div className="md:hidden mb-4">
        <button
          className="w-full px-4 py-2 bg-dental-50 text-dental-700 rounded-lg font-semibold shadow"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Hide Newsletters' : 'Show Newsletters'}
        </button>
      </div>
      <div className={`bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden ${open ? '' : 'hidden'} md:block`}>
        <div className="p-4 md:p-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Newsletters</h2>
          <ul className="space-y-2">
            {mockNewsletters.map((n, idx) => (
              <li key={idx}>
                <button
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-150 ${selected?.issueNumber === n.issueNumber ? 'bg-dental-50 text-dental-700 font-semibold' : 'hover:bg-neutral-50'}`}
                  onClick={() => onSelect(n)}
                >
                  <div className="flex flex-col">
                    <span className="truncate">{n.title}</span>
                    <span className="text-xs text-neutral-500">Issue #{n.issueNumber} &bull; {new Date(n.publishDate).toLocaleDateString()}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default NewsletterSidebar;
