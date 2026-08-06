import React from 'react';

export default function RecruitmentCharts({ candidates }) {
  const total = candidates.length || 1;

  const statuses = [
    { label: 'Applied', key: 'APPLIED', color: '#6366f1' },
    { label: 'Screening', key: 'SCREENING', color: '#a855f7' },
    { label: 'Interviewing', key: 'INTERVIEW', color: '#3b82f6' },
    { label: 'Offered', key: 'OFFERED', color: '#f59e0b' },
    { label: 'Hired', key: 'HIRED', color: '#10b981' },
    { label: 'Rejected', key: 'REJECTED', color: '#ef4444' }
  ];

  const chartData = statuses.map((s) => {
    const count = candidates.filter((c) => c.status === s.key).length;
    return { ...s, count };
  });

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-lg select-none space-y-4">
      <h4 className="text-xs font-black uppercase text-slateDark-400 tracking-wider border-b border-slateDark-900 pb-2">
        📊 Candidate Funnel Distribution
      </h4>

      <div className="space-y-4">
        {/* Horizontal stacked progress bar */}
        <div className="h-6 w-full rounded-full overflow-hidden flex bg-slateDark-900 border border-slateDark-800">
          {chartData.map((d, idx) => {
            const pct = (d.count / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={idx}
                style={{ width: `${pct}%`, backgroundColor: d.color }}
                title={`${d.label}: ${d.count} (${pct.toFixed(0)}%)`}
              />
            );
          })}
        </div>

        {/* Legend grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-[10px] font-bold text-slateDark-400">
          {chartData.map((d, idx) => {
            const pct = (d.count / total) * 100;
            return (
              <div key={idx} className="flex items-center space-x-2 bg-slateDark-905/30 border border-slateDark-900/60 p-2 rounded-xl">
                <span className="h-2 w-2 rounded-full block shrink-0" style={{ backgroundColor: d.color }}></span>
                <span>
                  {d.label}: {d.count} ({pct.toFixed(0)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
