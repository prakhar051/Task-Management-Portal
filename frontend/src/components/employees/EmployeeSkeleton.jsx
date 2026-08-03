import React from 'react';

export default function EmployeeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Search filters row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="h-10 bg-slateDark-800 rounded w-64" />
        <div className="flex gap-3">
          <div className="h-10 bg-slateDark-800 rounded w-32" />
          <div className="h-10 bg-slateDark-800 rounded w-32" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="glass rounded-xl border border-slateDark-800 overflow-hidden">
        <div className="h-12 bg-slateDark-900 border-b border-slateDark-850" />
        <div className="p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slateDark-900 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slateDark-800 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-slateDark-800 rounded w-28" />
                  <div className="h-3 bg-slateDark-900 rounded w-20" />
                </div>
              </div>
              <div className="h-4 bg-slateDark-800 rounded w-20" />
              <div className="h-4 bg-slateDark-800 rounded w-24" />
              <div className="h-4 bg-slateDark-900 rounded w-16" />
              <div className="h-8 bg-slateDark-800 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
