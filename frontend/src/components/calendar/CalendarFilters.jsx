import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/apiClient';

export default function CalendarFilters({ filters, onChange, onClear }) {
  const user = useAuthStore((state) => state.user);

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
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
        console.error('Failed to load calendar lookups', err);
      }
    };
    fetchLookups();
  }, [user]);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const eventTypes = [
    { value: 'TASK', label: '📋 Task Deadlines' },
    { value: 'PROJECT', label: '📂 Project Milestones' },
    { value: 'MEETING', label: '👥 Meetings' },
    { value: 'HOLIDAY', label: '🎉 Public Holidays' },
    { value: 'LEAVE', label: '🌴 Leaves' },
    { value: 'CUSTOM', label: '⚙️ Custom Events' }
  ];

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-4 flex flex-wrap gap-3.5 items-center select-none mt-4">
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

      {/* Event Type Filter */}
      <select
        value={filters.type}
        onChange={(e) => onChange({ type: e.target.value })}
        className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
      >
        <option value="">✨ Filter by Category</option>
        {eventTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="text-[10.5px] text-red-400 hover:text-white font-bold transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
