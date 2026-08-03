import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/apiClient';
import DateRangeFilter from './DateRangeFilter';

export default function AnalyticsToolbar({ filters, onChange, onClear }) {
  const user = useAuthStore((state) => state.user);

  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Only fetch departments & employees lookup for Admin and Manager roles
    const fetchLookups = async () => {
      try {
        if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
          const empRes = await apiClient.get('/employees?limit=100');
          if (empRes.data.success) setEmployees(empRes.data.data || []);
        }

        if (user?.role === 'ADMIN') {
          const deptRes = await apiClient.get('/departments?limit=100');
          if (deptRes.data.success) setDepartments(deptRes.data.data || []);
        }

        const projRes = await apiClient.get('/projects?limit=100');
        if (projRes.data.success) setProjects(projRes.data.data || []);
      } catch (err) {
        console.error('Failed to load toolbar lookups', err);
      }
    };
    fetchLookups();
  }, [user]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 items-center justify-between select-none">
      <div className="flex flex-wrap gap-3.5 items-center w-full xl:w-auto">
        {/* Department Filter (ADMIN only) */}
        {user?.role === 'ADMIN' && (
          <select
            value={filters.departmentId}
            onChange={(e) => onChange({ departmentId: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">🏢 All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {/* Project Filter */}
        {user?.role !== 'EMPLOYEE' && (
          <select
            value={filters.projectId}
            onChange={(e) => onChange({ projectId: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">📂 All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        {/* Employee Filter (ADMIN & MANAGER only) */}
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <select
            value={filters.employeeId}
            onChange={(e) => onChange({ employeeId: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">👤 All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        )}

        {/* Date pickers range */}
        <DateRangeFilter
          startDate={filters.startDate}
          endDate={filters.endDate}
          onChange={onChange}
        />

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-[10.5px] text-red-400 hover:text-white font-bold transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
