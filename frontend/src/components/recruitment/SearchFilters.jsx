import React from 'react';

export default function SearchFilters({ search, onSearchChange, statusFilter, onStatusFilterChange }) {
  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'APPLIED', label: 'Applied' },
    { value: 'SCREENING', label: 'Screening' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'OFFERED', label: 'Offered' },
    { value: 'HIRED', label: 'Hired' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between select-none">
      <div className="relative w-full sm:w-72">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateDark-500 text-xs">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search applicants name..."
          className="w-full pl-9 pr-4 py-2.5 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none"
        />
      </div>

      <div className="flex items-center space-x-3 text-xs font-semibold">
        <label className="text-slateDark-400">Pipeline Filter:</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white focus:outline-none cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
