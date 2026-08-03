import React from 'react';

export default function TaskSkeleton({ view = 'list' }) {
  if (view === 'kanban') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 animate-pulse">
        {[1, 2, 3, 4, 5].map((col) => (
          <div key={col} className="bg-slateDark-900/40 border border-slateDark-800/80 rounded-xl p-4 min-h-[500px]">
            <div className="h-5 bg-slateDark-800 rounded-md w-24 mb-4" />
            <div className="space-y-3">
              {[1, 2].map((card) => (
                <div key={card} className="bg-slateDark-950/40 p-4 border border-slateDark-900 rounded-lg space-y-3">
                  <div className="h-4 bg-slateDark-800 rounded-md w-16" />
                  <div className="h-5 bg-slateDark-800 rounded-md w-3/4" />
                  <div className="h-4 bg-slateDark-800 rounded-md w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="w-6 h-6 rounded-full bg-slateDark-800" />
                    <div className="h-4 bg-slateDark-800 rounded-md w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slateDark-900/40 border border-slateDark-800/80 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="h-10 bg-slateDark-800 rounded-lg w-full" />
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex items-center justify-between border-b border-slateDark-800 py-4 last:border-b-0">
          <div className="flex items-center space-x-4 w-1/3">
            <div className="w-4 h-4 bg-slateDark-800 rounded" />
            <div className="space-y-2 w-full">
              <div className="h-5 bg-slateDark-800 rounded-md w-16" />
              <div className="h-4 bg-slateDark-800 rounded-md w-4/5" />
            </div>
          </div>
          <div className="h-5 bg-slateDark-800 rounded-md w-24" />
          <div className="h-5 bg-slateDark-800 rounded-md w-16" />
          <div className="h-5 bg-slateDark-800 rounded-md w-20" />
          <div className="w-16 h-6 bg-slateDark-800 rounded-full" />
        </div>
      ))}
    </div>
  );
}
