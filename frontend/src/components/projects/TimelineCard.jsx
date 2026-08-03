import React from 'react';

export default function TimelineCard({ startDate, endDate, status }) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24)));

  const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  const isOverdue = now > end && status !== 'COMPLETED' && status !== 'CANCELLED';

  return (
    <div className="glass rounded-2xl border border-slateDark-800 p-6 space-y-4 select-none relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slateDark-900 pb-3">
        <h4 className="text-sm font-extrabold text-white">Project Timeline</h4>
        {isOverdue ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-red-400 bg-red-500/10 border-red-500/20 uppercase tracking-wide">
            Overdue
          </span>
        ) : status === 'COMPLETED' ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 uppercase tracking-wide">
            Completed
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-brand-400 bg-brand-500/10 border-brand-500/20 uppercase tracking-wide">
            {daysRemaining} Days Left
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">Start Date</span>
          <span className="text-slateDark-200 font-bold block mt-1">{formatDate(start)}</span>
        </div>

        <div>
          <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">Target Date</span>
          <span className="text-slateDark-200 font-bold block mt-1">{formatDate(end)}</span>
        </div>
      </div>

      {/* Progress timeline bar */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-xs text-slateDark-400 font-semibold">
          <span>Time Elapsed</span>
          <span>{percentElapsed}%</span>
        </div>
        <div className="h-1.5 bg-slateDark-900 rounded-full overflow-hidden border border-slateDark-850">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isOverdue ? 'bg-red-500' : 'bg-brand-500'}`}
            style={{ width: `${percentElapsed}%` }}
          />
        </div>
      </div>
    </div>
  );
}
