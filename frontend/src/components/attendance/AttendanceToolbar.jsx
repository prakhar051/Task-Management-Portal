import React from 'react';

export default function AttendanceToolbar({ year, month, onChangeDate, onExport, showExport = false }) {
  const years = [2025, 2026, 2027];
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between select-none">
      {/* Date Pickers */}
      <div className="flex items-center space-x-3.5">
        <select
          value={month}
          onChange={(e) => onChangeDate(year, parseInt(e.target.value))}
          className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => onChangeDate(parseInt(e.target.value), month)}
          className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {showExport && (
        <button
          onClick={onExport}
          className="px-4.5 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10"
        >
          📥 Export CSV Report
        </button>
      )}
    </div>
  );
}
