import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';

export default function BulkActionToolbar() {
  const selectedIds = useTaskStore((state) => state.selectedIds);
  const clearSelection = useTaskStore((state) => state.clearSelection);
  const bulkDelete = useTaskStore((state) => state.bulkDeleteTasks);
  const bulkRestore = useTaskStore((state) => state.bulkRestoreTasks);
  const bulkStatus = useTaskStore((state) => state.bulkUpdateStatus);
  const bulkPriority = useTaskStore((state) => state.bulkUpdatePriority);

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  if (selectedIds.length === 0) return null;

  const handleStatusChange = async (e) => {
    const targetStatus = e.target.value;
    if (targetStatus) {
      if (window.confirm(`Are you sure you want to update the status of ${selectedIds.length} tasks to ${targetStatus}?`)) {
        await bulkStatus(targetStatus);
      }
      setStatus('');
    }
  };

  const handlePriorityChange = async (e) => {
    const targetPriority = e.target.value;
    if (targetPriority) {
      if (window.confirm(`Are you sure you want to update the priority of ${selectedIds.length} tasks to ${targetPriority}?`)) {
        await bulkPriority(targetPriority);
      }
      setPriority('');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to soft delete the ${selectedIds.length} selected tasks?`)) {
      await bulkDelete();
    }
  };

  const handleRestore = async () => {
    if (window.confirm(`Are you sure you want to restore the ${selectedIds.length} selected tasks?`)) {
      await bulkRestore();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slateDark-900 border border-brand-500/30 text-white px-6 py-4 rounded-2xl flex items-center space-x-6 shadow-2xl z-50 animate-bounce-in min-w-[500px]">
      <div className="flex items-center space-x-2 border-r border-slateDark-800 pr-4">
        <span className="text-brand-400 font-bold font-mono">{selectedIds.length}</span>
        <span className="text-slateDark-400 text-xs font-bold uppercase tracking-wider">selected</span>
      </div>

      <div className="flex flex-1 items-center justify-between space-x-4">
        <div className="flex items-center space-x-3">
          {/* Status changer */}
          <select
            value={status}
            onChange={handleStatusChange}
            className="px-3 py-1.5 bg-slateDark-850 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white text-xs font-semibold rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="">Status...</option>
            <option value="TODO">📝 Todo</option>
            <option value="IN_PROGRESS">⚡ In Progress</option>
            <option value="IN_REVIEW">🔬 In Review</option>
            <option value="BLOCKED">🛑 Blocked</option>
            <option value="COMPLETED">✅ Completed</option>
            <option value="CANCELLED">❌ Cancelled</option>
          </select>

          {/* Priority changer */}
          <select
            value={priority}
            onChange={handlePriorityChange}
            className="px-3 py-1.5 bg-slateDark-850 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white text-xs font-semibold rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="">Priority...</option>
            <option value="LOW">🔵 Low</option>
            <option value="MEDIUM">🟢 Medium</option>
            <option value="HIGH">🟡 High</option>
            <option value="URGENT">🔴 Urgent</option>
          </select>

          {/* Actions */}
          <button
            onClick={handleRestore}
            className="px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-bold rounded-lg border border-brand-500/20 transition-colors"
          >
            Restore
          </button>

          <button
            onClick={handleDelete}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition-colors"
          >
            Delete
          </button>
        </div>

        <button
          onClick={clearSelection}
          className="text-slateDark-500 hover:text-white text-xs font-semibold transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
