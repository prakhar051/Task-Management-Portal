import React from 'react';

export default function ProgressBar({ progress }) {
  const percentage = Math.min(100, Math.max(0, progress));

  // Determine indicator colors depending on progress tiers
  let colorClass = 'bg-brand-500';
  if (percentage >= 100) {
    colorClass = 'bg-emerald-500';
  } else if (percentage >= 50) {
    colorClass = 'bg-indigo-500';
  } else if (percentage >= 25) {
    colorClass = 'bg-amber-500';
  } else if (percentage > 0) {
    colorClass = 'bg-rose-500';
  }

  return (
    <div className="flex items-center space-x-3 select-none w-full min-w-[120px]">
      <div className="flex-1 bg-slateDark-900 rounded-full h-2 overflow-hidden border border-slateDark-850">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold font-mono text-slateDark-300 min-w-[34px] text-right">
        {percentage}%
      </span>
    </div>
  );
}
