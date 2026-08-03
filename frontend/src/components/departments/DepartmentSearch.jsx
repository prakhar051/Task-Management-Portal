import React, { useState, useEffect } from 'react';
import { useDepartmentStore } from '../../store/departmentStore';

export default function DepartmentSearch() {
  const { filters, setFilters } = useDepartmentStore();
  const [search, setSearch] = useState(filters.search);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters({ search });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, setFilters]);

  return (
    <div className="relative flex-grow max-w-md">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, code, manager, location..."
        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500 placeholder-slateDark-500"
      />
      <span className="absolute left-3.5 top-3 text-slateDark-500 text-sm select-none">
        🔍
      </span>
    </div>
  );
}
