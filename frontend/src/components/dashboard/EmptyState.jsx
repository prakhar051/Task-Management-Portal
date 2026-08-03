import React from 'react';

export default function EmptyState({ message = 'No data available at this time.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slateDark-800 rounded-2xl glass">
      <div className="text-4xl mb-4 select-none">📭</div>
      <h4 className="text-white font-bold text-sm">Dashboard State Empty</h4>
      <p className="text-slateDark-400 text-xs mt-1 max-w-xs">{message}</p>
    </div>
  );
}
