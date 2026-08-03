import React from 'react';
import { useAuthStore } from '../../store/authStore';
import DepartmentFilters from './DepartmentFilters';

export default function DepartmentToolbar({ onAddClick }) {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };

  return (
    <div className="space-y-4">
      {/* Title & Addition row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slateDark-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Departments Directory</h1>
          <p className="text-slateDark-400 text-sm mt-1">Manage corporate organization, manager mappings, and workforce counts.</p>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={onAddClick}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center gap-2 select-none"
          >
            <span>🏢</span>
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Embedded filters row */}
      <DepartmentFilters />
    </div>
  );
}
