import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';

export default function TaskSearch() {
  const filters = useTaskStore((state) => state.filters);
  const setFilters = useTaskStore((state) => state.setFilters);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Debounced execution logic
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters({ search: searchTerm });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, setFilters]);

  // Sync state if store reset is called
  useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  return (
    <div className="relative flex-1 min-w-[280px]">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slateDark-400 text-base select-none">
        🔍
      </span>
      <input
        type="text"
        placeholder="Search code, title, assignees or projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-sm font-semibold transition-all focus:outline-none placeholder-slateDark-500"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slateDark-500 hover:text-white text-xs bg-slateDark-800 hover:bg-slateDark-700 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}
