import React from 'react';
import { useAuthStore } from '../../store/authStore';
import ProjectFilters from './ProjectFilters';

export default function ProjectToolbar({ onAddClick }) {
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };

  return (
    <div className="space-y-4">
      {/* Title & Button Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slateDark-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Projects Directory</h1>
          <p className="text-slateDark-400 text-sm mt-1">
            Track development pipelines, managers assignments, members rosters, and progress schedules.
          </p>
        </div>

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={onAddClick}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center gap-2 select-none"
          >
            <span>📂</span>
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <ProjectFilters />
    </div>
  );
}
