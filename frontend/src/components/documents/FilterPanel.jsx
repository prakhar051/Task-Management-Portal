import React from 'react';

export default function FilterPanel({ activeFilters, onFilterChange, onReset }) {
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'PDF', label: 'PDF Files' },
    { value: 'IMAGE', label: 'Images' },
    { value: 'SPREADSHEET', label: 'Spreadsheets' },
    { value: 'CONTRACT', label: 'Contracts' },
    { value: 'PROFILE', label: 'Profiles' },
    { value: 'REPORT', label: 'Reports' },
    { value: 'OTHER', label: 'Others' }
  ];

  const scopes = [
    { value: '', label: 'All Scopes' },
    { value: 'GENERAL', label: 'General' },
    { value: 'EMPLOYEE', label: 'Employee' },
    { value: 'PROJECT', label: 'Project' },
    { value: 'TASK', label: 'Task' },
    { value: 'DEPARTMENT', label: 'Department' },
    { value: 'LEAVE', label: 'Leave' },
    { value: 'ATTENDANCE', label: 'Attendance' }
  ];

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-4 flex flex-wrap gap-4 items-center select-none text-xs font-semibold">
      <div className="flex items-center space-x-2">
        <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider block">Category:</span>
        <select
          value={activeFilters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white focus:outline-none cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider block">Scope:</span>
        <select
          value={activeFilters.entityType}
          onChange={(e) => onFilterChange({ entityType: e.target.value })}
          className="px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white focus:outline-none cursor-pointer"
        >
          {scopes.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {(activeFilters.category || activeFilters.entityType || activeFilters.search) && (
        <button
          onClick={onReset}
          className="px-3 py-1.5 border border-slateDark-850 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl transition-all ml-auto text-[10px] font-black"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
