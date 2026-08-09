import React, { useEffect, useState } from 'react';
import useMonitoringStore from '../store/monitoringStore';
import { AlertOctagon, CheckCircle, RefreshCw } from 'lucide-react';

const ErrorLogs = () => {
  const errors = useMonitoringStore((state) => state.errors);
  const fetchErrors = useMonitoringStore((state) => state.fetchErrors);
  const resolveError = useMonitoringStore((state) => state.resolveError);

  const [status, setStatus] = useState('UNRESOLVED');

  useEffect(() => {
    fetchErrors({ resolutionStatus: status });
  }, [status, fetchErrors]);

  const handleResolve = async (id) => {
    await resolveError(id);
    alert('Error status marked as RESOLVED!');
  };

  return (
    <div className="space-y-6 text-left select-none max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <AlertOctagon className="w-6 h-6 text-rose-500" />
            <span>Enterprise Diagnostics & Error Registry</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Examine unresolved runtime stack traces, modular warnings, and log errors details.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-zinc-950 border border-zinc-900 text-white rounded-xl text-xs focus:outline-none"
          >
            <option value="UNRESOLVED">Unresolved Errors</option>
            <option value="RESOLVED">Resolved History</option>
          </select>
          <button
            onClick={() => fetchErrors({ resolutionStatus: status })}
            className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Errors list */}
      <div className="space-y-4">
        {errors.map((err) => (
          <div key={err.id} className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded uppercase">
                  {err.module}
                </span>
                <h4 className="text-sm font-bold text-white mt-2 leading-snug">{err.message}</h4>
              </div>

              {err.resolutionStatus === 'UNRESOLVED' && (
                <button
                  onClick={() => handleResolve(err.id)}
                  className="flex items-center space-x-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Resolved</span>
                </button>
              )}
            </div>

            {err.stack && (
              <pre className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl overflow-x-auto font-mono text-[10px] text-zinc-500 max-h-48 leading-relaxed whitespace-pre-wrap break-all">
                {err.stack}
              </pre>
            )}

            <div className="text-[10px] text-zinc-500 font-semibold flex items-center justify-between border-t border-zinc-900/60 pt-3">
              <span>Timestamp: {new Date(err.createdAt).toLocaleString()}</span>
              <span>Resolution: <strong className={err.resolutionStatus === 'RESOLVED' ? 'text-emerald-400' : 'text-rose-400'}>{err.resolutionStatus}</strong></span>
            </div>
          </div>
        ))}

        {errors.length === 0 && (
          <div className="text-center py-12 border border-dashed border-zinc-900 rounded-2xl text-zinc-500 text-xs italic">
            No system diagnostics logs found matching the filter bounds.
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorLogs;
