import React from 'react';

const LogViewer = ({ logs }) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'WARN':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'DEBUG':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl p-5 space-y-4 select-none text-left">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">System Event Stream</h4>
        <span className="text-[10px] text-zinc-500 font-mono">{logs.length} logs displayed</span>
      </div>

      <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1.5 font-mono text-[11px] leading-relaxed">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start space-x-3.5 p-3 bg-zinc-950/65 border border-zinc-900 rounded-xl hover:border-zinc-800 transition-colors"
          >
            {/* Timestamp */}
            <span className="text-zinc-500 shrink-0 text-[10px] select-none mt-0.5">
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>

            {/* Severity Level badge */}
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getLevelColor(log.level)}`}>
              {log.level}
            </span>

            {/* Module identifier */}
            <span className="text-brand-400 font-bold shrink-0">
              [{log.module}]
            </span>

            {/* Message */}
            <span className="text-zinc-300 break-all">
              {log.message}
            </span>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 text-xs text-zinc-500 italic">
            No matching event logs resolved.
          </div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
