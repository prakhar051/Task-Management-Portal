import React from 'react';

export default function BreakTimer({ activeSession }) {
  if (!activeSession || activeSession.type !== 'BREAK') return null;

  return (
    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
      <div className="space-y-0.5">
        <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider">Break Mode Active</h4>
        <p className="text-[10px] text-slateDark-500 font-semibold">Your working hours metrics are paused.</p>
      </div>
      <span className="animate-ping rounded-full h-2.5 w-2.5 bg-purple-400"></span>
    </div>
  );
}
