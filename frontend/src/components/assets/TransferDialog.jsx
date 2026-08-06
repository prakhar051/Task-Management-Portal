import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../api/apiClient';

const TransferDialog = ({ isOpen, onClose, asset, onTransfer }) => {
  const [employees, setEmployees] = useState([]);
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/employees')
        .then((res) => setEmployees(res.data.data))
        .catch(() => setError('Failed to retrieve employee list.'));
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toEmployeeId) return setError('Please select a recipient employee.');
    if (toEmployeeId === asset.currentEmployeeId) {
      return setError('Recipient employee cannot be the current assignee.');
    }
    setLoading(true);
    setError(null);
    try {
      await onTransfer({
        assetId: asset.id,
        toEmployeeId,
        notes
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-100">Transfer Asset</h2>
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

          {asset.currentEmployee && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">From Employee</label>
              <div className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400">
                {asset.currentEmployee.firstName} {asset.currentEmployee.lastName}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">To Employee</label>
            <select
              value={toEmployeeId}
              onChange={(e) => setToEmployeeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
            >
              <option value="">-- Choose Recipient Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Transfer Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Reason for hardware transfer request..."
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
              {loading ? 'Transferring...' : 'Transfer Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferDialog;
