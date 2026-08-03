import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';

export default function BulkActionToolbar() {
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { selectedIds, clearBulkSelection, bulkDelete, bulkUpdateStatus, bulkRestore, filters } = useProjectStore();

  if (selectedIds.length === 0 || currentUser.role !== 'ADMIN') return null;

  const handleBulkStatusChange = async (e) => {
    const status = e.target.value;
    if (!status) return;

    if (window.confirm(`Are you sure you want to update status to ${status} for ${selectedIds.length} projects?`)) {
      const res = await bulkUpdateStatus(status);
      if (res.success) {
        clearBulkSelection();
      } else {
        alert(res.error);
      }
    }
    e.target.value = '';
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to soft delete ${selectedIds.length} projects?`)) {
      const res = await bulkDelete();
      if (res.success) {
        clearBulkSelection();
      } else {
        alert(res.error);
      }
    }
  };

  const handleBulkRestore = async () => {
    if (window.confirm(`Are you sure you want to restore ${selectedIds.length} archived projects?`)) {
      const res = await bulkRestore();
      if (res.success) {
        clearBulkSelection();
      } else {
        alert(res.error);
      }
    }
  };

  const isTrashMode = filters.isDeleted === 'true';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 gap-3 animate-fade-in select-none">
      <div className="text-sm font-semibold">
        Selected: <span className="font-extrabold text-white">{selectedIds.length}</span> projects
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isTrashMode ? (
          <button
            onClick={handleBulkRestore}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors"
          >
            ♻️ Restore Selected
          </button>
        ) : (
          <>
            <select
              onChange={handleBulkStatusChange}
              className="px-3 py-2 rounded bg-slateDark-950 border border-brand-500/20 text-brand-400 text-xs font-bold focus:outline-none"
            >
              <option value="">Update Status...</option>
              <option value="PLANNING">PLANNING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold text-xs transition-colors"
            >
              🗑️ Delete Selected
            </button>
          </>
        )}

        <button
          onClick={clearBulkSelection}
          className="text-xs text-slateDark-400 hover:text-white transition-colors pl-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
