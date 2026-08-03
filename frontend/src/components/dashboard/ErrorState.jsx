import React from 'react';

export default function ErrorState({ errorMsg = 'An unexpected connection error occurred.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-red-500/10 rounded-2xl bg-red-500/5 glass">
      <div className="text-4xl mb-4 select-none">⚠️</div>
      <h4 className="text-red-400 font-bold text-sm">Server Query Failure</h4>
      <p className="text-red-500/80 text-xs mt-1 max-w-xs">{errorMsg}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold transition-all active:scale-95"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}
