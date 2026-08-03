import React from 'react';

export default function DateRangeFilter({ startDate, endDate, onChange }) {
  return (
    <div className="flex items-center space-x-2 select-none">
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange({ startDate: e.target.value })}
        className="px-3.5 py-1.5 bg-slateDark-900 border border-slateDark-800 text-white rounded-xl text-xs focus:outline-none"
      />
      <span className="text-slateDark-500 text-xs font-semibold">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange({ endDate: e.target.value })}
        className="px-3.5 py-1.5 bg-slateDark-900 border border-slateDark-800 text-white rounded-xl text-xs focus:outline-none"
      />
    </div>
  );
}
