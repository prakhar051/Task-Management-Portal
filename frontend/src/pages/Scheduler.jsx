import React, { useEffect } from 'react';
import useMonitoringStore from '../store/monitoringStore';
import JobSchedulerTable from '../components/admin/JobSchedulerTable';
import { CalendarRange, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const Scheduler = () => {
  const jobs = useMonitoringStore((state) => state.jobs);
  const executions = useMonitoringStore((state) => state.jobExecutions);
  const fetchJobs = useMonitoringStore((state) => state.fetchJobs);
  const fetchJobExecutions = useMonitoringStore((state) => state.fetchJobExecutions);

  useEffect(() => {
    fetchJobs();
    fetchJobExecutions();
  }, [fetchJobs, fetchJobExecutions]);

  return (
    <div className="space-y-6 text-left select-none max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <CalendarRange className="w-6 h-6 text-brand-400" />
            <span>Scheduled Jobs & Cron Manager</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Configure calendar intervals, trigger payroll routines, and examine executions run logs.
          </p>
        </div>

        <button
          onClick={() => {
            fetchJobs();
            fetchJobExecutions();
          }}
          className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active Jobs roster */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Configure Cron Schedules</h3>
        <JobSchedulerTable jobs={jobs} />
      </div>

      {/* Execution history streams */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
          Executions Run Logs History
        </h3>

        <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="p-4">Cron Job Name</th>
                <th className="p-4">Execution Time</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4">Output Log Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-xs">
              {executions.map((exec) => (
                <tr key={exec.id} className="hover:bg-zinc-900/10 transition-colors text-zinc-300">
                  <td className="p-4 font-bold text-white">{exec.job?.name || 'Manual Run'}</td>
                  <td className="p-4 text-[10px] text-zinc-500 font-mono">
                    {new Date(exec.executedAt).toLocaleString()}
                  </td>
                  <td className="p-4 font-mono text-[10px] text-zinc-500">{exec.durationMs ?? 0} ms</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      exec.status === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {exec.status === 'SUCCESS' ? (
                        <CheckCircle className="w-3 h-3 shrink-0" />
                      ) : (
                        <XCircle className="w-3 h-3 shrink-0" />
                      )}
                      <span>{exec.status}</span>
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[9px] text-zinc-400 max-w-xs truncate" title={exec.logs || exec.error}>
                    {exec.logs || exec.error || 'N/A'}
                  </td>
                </tr>
              ))}
              {executions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 italic">
                    No scheduler jobs execution runs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
