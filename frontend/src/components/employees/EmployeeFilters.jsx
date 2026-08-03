import React, { useState, useEffect } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';

export default function EmployeeFilters() {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { filters, setFilters, selectedIds, clearBulkSelection, bulkDelete, bulkUpdateStatus, bulkRestore, exportData } = useEmployeeStore();

  const [search, setSearch] = useState(filters.search);

  // Debounced search trigger (wait 400ms)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters({ search });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, setFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleBulkStatusChange = async (e) => {
    const status = e.target.value;
    if (!status) return;
    if (window.confirm(`Are you sure you want to update status to ${status} for ${selectedIds.length} employees?`)) {
      await bulkUpdateStatus(status);
      clearBulkSelection();
    }
    e.target.value = ''; // Reset select tag
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to soft delete ${selectedIds.length} employees?`)) {
      await bulkDelete();
      clearBulkSelection();
    }
  };

  const handleBulkRestore = async () => {
    if (window.confirm(`Are you sure you want to restore ${selectedIds.length} deleted employees?`)) {
      await bulkRestore();
      clearBulkSelection();
    }
  };

  const handleExport = async (format) => {
    await exportData(format);
  };

  const isTrashMode = filters.isDeleted === 'true';

  return (
    <div className="space-y-4">
      {/* Primary filters row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, designation..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            />
            <span className="absolute left-3 top-3 text-slateDark-500 text-sm select-none">
              🔍
            </span>
          </div>

          {/* Status selector */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          {/* View Mode (Active vs Trash) - ADMIN only */}
          {user.role === 'ADMIN' && (
            <select
              name="isDeleted"
              value={filters.isDeleted}
              onChange={handleFilterChange}
              className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="false">Active Profiles</option>
              <option value="true">Archived Trash</option>
            </select>
          )}
        </div>

        {/* Action triggers (Export / Sorting) */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">Sort By (Default)</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="employeeCode">Employee Code</option>
            <option value="hireDate">Hire Date</option>
            <option value="status">Status</option>
          </select>

          <select
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <div className="flex border border-slateDark-800 rounded-lg overflow-hidden bg-slateDark-900 text-sm">
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2.5 hover:bg-slateDark-800 border-r border-slateDark-850 text-slateDark-300 font-semibold transition-colors"
              title="Export CSV"
            >
              📥 CSV
            </button>
            <button
              onClick={() => handleExport('xlsx')}
              className="px-4 py-2.5 hover:bg-slateDark-800 text-slateDark-300 font-semibold transition-colors"
              title="Export Excel"
            >
              📊 XLSX
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action selection banner */}
      {selectedIds.length > 0 && user.role === 'ADMIN' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 gap-3 animate-fade-in">
          <div className="text-sm font-semibold select-none">
            Selected: <span className="font-extrabold">{selectedIds.length}</span> profiles
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
                  className="px-3 py-2 rounded bg-slateDark-950 border border-brand-500/20 text-brand-400 text-xs font-bold"
                >
                  <option value="">Update Status...</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="ON_LEAVE">ON_LEAVE</option>
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
              className="text-xs text-slateDark-400 hover:text-white transition-colors"
            >
              Cancel selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
