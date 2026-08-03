import React from 'react';

export default function DepartmentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Cards stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-slateDark-900 rounded-2xl border border-slateDark-800" />
        ))}
      </div>

      {/* Table grid skeleton */}
      <div className="glass rounded-xl border border-slateDark-800 overflow-hidden">
        <div className="h-12 bg-slateDark-900 border-b border-slateDark-850" />
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slateDark-900 last:border-0">
              <div className="space-y-2">
                <div className="h-4 bg-slateDark-800 rounded w-44" />
                <div className="h-3 bg-slateDark-900 rounded w-24" />
              </div>
              <div className="h-4 bg-slateDark-800 rounded w-16" />
              <div className="h-4 bg-slateDark-800 rounded w-24" />
              <div className="h-4 bg-slateDark-900 rounded w-20" />
              <div className="h-8 bg-slateDark-800 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
