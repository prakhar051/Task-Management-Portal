import React from 'react';

export default function RecruitmentToolbar({ activeTab, onTabChange }) {
  const tabs = [
    { value: 'dashboard', label: 'Funnel Dashboard' },
    { value: 'jobs', label: 'Job Positions' },
    { value: 'candidates', label: 'Applicants Pipeline' },
    { value: 'interviews', label: 'Interview calendars' }
  ];

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-3xl p-4 flex flex-wrap gap-3 items-center justify-between select-none">
      <div className="flex flex-wrap border border-slateDark-850 rounded-xl overflow-hidden bg-slateDark-955/35">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => onTabChange(t.value)}
            className={`px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === t.value ? 'bg-slateDark-900 text-white' : 'bg-transparent text-slateDark-500 hover:text-slateDark-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
