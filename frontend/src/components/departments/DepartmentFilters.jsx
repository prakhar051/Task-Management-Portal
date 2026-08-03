import React from 'react';
import { useDepartmentStore } from '../../store/departmentStore';
import { useAuthStore } from '../../store/authStore';
import DepartmentSearch from './DepartmentSearch';

export default function DepartmentFilters() {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { filters, setFilters, exportData } = useDepartmentStore();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleExport = async (format) => {
    await exportData(format);
  };

  return (
    <div className="space-y-4">
      {/* Primary search and status filter row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <DepartmentSearch />

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
          </select>

          {/* Location filter */}
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="Filter by location..."
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500 placeholder-slateDark-500"
          />

          {/* View mode (Active vs Trash) - ADMIN only */}
          {user.role === 'ADMIN' && (
            <select
              name="isDeleted"
              value={filters.isDeleted}
              onChange={handleFilterChange}
              className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="false">Active Departments</option>
              <option value="true">Archived Trash</option>
            </select>
          )}
        </div>

        {/* Sort configurations and export buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">Sort By (Default)</option>
            <option value="name">Name</option>
            <option value="employeeCount">Employee Count</option>
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
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
    </div>
  );
}
