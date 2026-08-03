import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-6 border-b border-slateDark-900">
        <div className="space-y-2">
          <div className="h-8 bg-slateDark-800 rounded w-64" />
          <div className="h-4 bg-slateDark-900 rounded w-40" />
        </div>
        <div className="h-10 bg-slateDark-800 rounded w-48 hidden md:block" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-6 border border-slateDark-800 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slateDark-800 rounded w-24" />
              <div className="w-10 h-10 bg-slateDark-900 rounded-lg" />
            </div>
            <div className="h-8 bg-slateDark-800 rounded w-16" />
            <div className="h-3 bg-slateDark-900 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Dynamic Grids Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6 border border-slateDark-800 h-80 space-y-4">
          <div className="h-4 bg-slateDark-800 rounded w-40" />
          <div className="h-full bg-slateDark-900/50 rounded-lg w-full" />
        </div>
        <div className="glass rounded-xl p-6 border border-slateDark-800 h-80 space-y-4">
          <div className="h-4 bg-slateDark-800 rounded w-40" />
          <div className="h-full bg-slateDark-900/50 rounded-lg w-full" />
        </div>
      </div>
    </div>
  );
}
