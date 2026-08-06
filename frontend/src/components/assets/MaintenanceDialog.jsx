import React, { useState } from 'react';
import { X } from 'lucide-react';

const MaintenanceDialog = ({ isOpen, onClose, asset, onSchedule }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(0);
  const [scheduledDate, setScheduledDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return setError('Please enter a maintenance title.');
    if (!scheduledDate) return setError('Please select a scheduled date.');
    setLoading(true);
    setError(null);
    try {
      await onSchedule({
        assetId: asset.id,
        title,
        description,
        cost: parseFloat(cost) || 0.0,
        scheduledDate: new Date(scheduledDate).toISOString(),
        status: 'SCHEDULED'
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule maintenance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100">Schedule Maintenance</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Asset Tag / Name</label>
            <div className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono font-medium">
              [{asset.tag}] {asset.name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Maintenance Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Screen Replacement, OS Upgrades..."
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Estimated Cost ($)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Scheduled Date</label>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Job Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Describe hardware diagnostic actions or replacement specifications..."
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none transition-colors"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 transition-colors"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceDialog;
