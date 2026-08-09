import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAutomationStore from '../store/automationStore';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const AutomationHistory = () => {
  const history = useAutomationStore((state) => state.history);
  const loading = useAutomationStore((state) => state.loading);
  const fetchHistory = useAutomationStore((state) => state.fetchHistory);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="space-y-6 select-none text-left">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <Link
          to="/automation"
          className="flex items-center space-x-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rules Center</span>
        </Link>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Automation Run Logs</h1>
        <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider">
          Review rules trigger outcomes, parameter mapping payloads, and error logs.
        </p>
      </div>

      {/* History table */}
      <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <th className="p-4">Triggered Rule</th>
              <th className="p-4">Executed At</th>
              <th className="p-4">Outcome details</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-xs">
            {history.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-900/10 transition-colors text-zinc-300">
                <td className="p-4 font-bold text-white">
                  {log.rule?.title || 'Unknown Rule'}
                </td>
                <td className="p-4 text-[10px] text-zinc-500 font-mono">
                  {new Date(log.executedAt).toLocaleString()}
                </td>
                <td className="p-4 font-mono text-[10px] text-zinc-400 max-w-xs truncate" title={log.actionResult || log.errorMessage}>
                  {log.actionResult || log.errorMessage || 'No details'}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle className="w-3 h-3 shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 shrink-0" />
                    )}
                    <span>{log.status}</span>
                  </span>
                </td>
              </tr>
            ))}
            {history.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500 italic">
                  No execution logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutomationHistory;
