import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import ProjectSearch from './ProjectSearch';

export default function ProjectFilters() {
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { filters, setFilters, exportData } = useProjectStore();

  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const loadFilterMetadata = async () => {
      try {
        const { apiClient } = await import('../../api/apiClient');
        const [deptsRes, empsRes] = await Promise.all([
          apiClient.get('/departments?limit=1000'),
          apiClient.get('/employees?limit=1000')
        ]);
        setDepartments(deptsRes.data.data || []);
        setManagers(empsRes.data.data || []);
      } catch (err) {
        console.error('Failed loading projects filter configs:', err);
      }
    };
    loadFilterMetadata();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const handleExport = (format) => {
    exportData(format);
  };

  return (
    <div className="space-y-4">
      {/* Primary Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 flex flex-wrap gap-3">
          <ProjectSearch />

          {/* Status selector */}
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Priority selector */}
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Department selector */}
          <select
            name="departmentId"
            value={filters.departmentId}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500 max-w-[200px]"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Manager selector */}
          <select
            name="managerId"
            value={filters.managerId}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500 max-w-[200px]"
          >
            <option value="">All Managers</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>

          {/* View mode (Active vs Archive) - ADMIN only */}
          {currentUser.role === 'ADMIN' && (
            <select
              name="isDeleted"
              value={filters.isDeleted}
              onChange={handleFilterChange}
              className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="false">Active Projects</option>
              <option value="true">Archived Trash</option>
            </select>
          )}
        </div>

        {/* Sort configurations & download buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="createdAt">Sort: Created Date</option>
            <option value="name">Sort: Project Name</option>
            <option value="progress">Sort: Progress</option>
            <option value="startDate">Sort: Start Date</option>
            <option value="endDate">Sort: End Date</option>
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

          {/* Export button group - ADMIN/MANAGER only */}
          {(currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') && (
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
          )}
        </div>
      </div>
    </div>
  );
}
