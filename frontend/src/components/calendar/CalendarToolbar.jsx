import React from 'react';

export default function CalendarToolbar({ selectedDate, view, onViewChange, onNavigate }) {
  const getHeaderTitle = () => {
    return selectedDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between select-none">
      {/* Date Navigation */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={() => onNavigate('prev')}
          className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 hover:bg-slateDark-800 text-white rounded-xl text-xs font-bold transition-all"
        >
          ◀
        </button>
        <h2 className="text-sm font-black text-white px-2 tracking-wide font-mono w-44 text-center">
          {getHeaderTitle()}
        </h2>
        <button
          onClick={() => onNavigate('next')}
          className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 hover:bg-slateDark-800 text-white rounded-xl text-xs font-bold transition-all"
        >
          ▶
        </button>
        <button
          onClick={() => onNavigate('today')}
          className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 hover:bg-slateDark-800 text-white rounded-xl text-xs font-bold transition-all"
        >
          Today
        </button>
      </div>

      {/* Grid Switchers */}
      <div className="flex bg-slateDark-900 border border-slateDark-850 rounded-xl p-0.5">
        {[
          { id: 'month', label: 'Month' },
          { id: 'week', label: 'Week' },
          { id: 'day', label: 'Day' }
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`px-4 py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all ${
              view === v.id
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slateDark-400 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
