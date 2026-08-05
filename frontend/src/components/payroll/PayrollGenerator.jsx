import React, { useState } from 'react';

export default function PayrollGenerator({ onGenerate, loading }) {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

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

  const years = [2025, 2026, 2027];

  const handleGenerateClick = () => {
    onGenerate(month, year);
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 space-y-4 shadow-md select-none">
      <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
        ⚙️ Generate New Monthly Payroll
      </h3>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 text-xs font-semibold">
        <div className="flex-1 grid grid-cols-2 gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white focus:outline-none cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white focus:outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl font-black transition-all shadow-md shadow-brand-500/10 disabled:opacity-50"
        >
          {loading ? 'Processing math...' : 'Generate Run Calculations'}
        </button>
      </div>
    </div>
  );
}
