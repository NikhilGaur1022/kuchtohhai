import React, { useState } from 'react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => Promise<void>;
  loading: boolean;
}

const REASONS = [
  'Spam',
  'Offensive',
  'Misinformation',
  'Harassment',
  'Other',
];

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    await onSubmit(reason, description);
    setReason('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
        <h2 className="text-lg font-semibold mb-4">Report Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reason <span className="text-red-500">*</span></label>
            <select
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-dental-500"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            >
              <option value="">Select a reason</option>
              {REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <textarea
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-dental-500"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more details (optional)"
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Reporting...' : 'Report Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
