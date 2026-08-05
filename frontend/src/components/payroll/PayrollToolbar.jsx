import React from 'react';

export default function PayrollToolbar({ search, onSearchChange, activeTab, onTabChange }) {
  const tabs = [
    { value: 'structures', label: 'Salary Structures' },
    { value: 'runs', label: 'Payroll Runs' }
  ];

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-3xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between select-none">
      {/* Tabs */}
      <div className="flex border border-slateDark-850 rounded-xl overflow-hidden">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => onTabChange(t.value)}
            className={`px-4 py-2 text-xs font-bold transition-all ${
              activeTab === t.value ? 'bg-slateDark-900 text-white' : 'bg-transparent text-slateDark-500 hover:text-slateDark-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Filter */}
      {activeTab === 'structures' && (
        <div className="relative w-full sm:w-64">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateDark-500 text-xs">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employee templates..."
            className="w-full pl-9 pr-4 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
