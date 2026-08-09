import React from 'react';
import useMonitoringStore from '../../store/monitoringStore';
import { Play, ToggleLeft, ToggleRight } from 'lucide-react';

const JobSchedulerTable = ({ jobs }) => {
  const runJobNow = useMonitoringStore((state) => state.runJobNow);
  const updateJob = useMonitoringStore((state) => state.updateJob);

  const handleRun = async (id) => {
    try {
      await runJobNow(id);
      alert('Scheduled job manually triggered successfully!');
    } catch (err) {
      alert('Failed to trigger background job.');
    }
  };

  const handleToggle = async (job) => {
    const nextStatus = job.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    await updateJob(job.id, { status: nextStatus });
  };

  return (
    <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl overflow-hidden select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <th className="p-4">Cron Job Name</th>
            <th className="p-4">Cron Expression</th>
            <th className="p-4">Last Executed</th>
            <th className="p-4">Next Scheduled</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900 text-xs">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-zinc-900/10 transition-colors text-zinc-300">
              <td className="p-4 font-bold text-white">{job.name}</td>
              <td className="p-4 font-mono text-[10px] text-brand-400">{job.cronExpr}</td>
              <td className="p-4 text-zinc-500 font-mono text-[10px]">
                {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
              </td>
              <td className="p-4 text-zinc-500 font-mono text-[10px]">
                {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Pending'}
              </td>
              <td className="p-4">
                <button
                  onClick={() => handleToggle(job)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                    job.status === 'ENABLED'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-900 text-zinc-500'
                  }`}
                >
                  {job.status === 'ENABLED' ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                      <span>ENABLED</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-zinc-500" />
                      <span>DISABLED</span>
                    </>
                  )}
                </button>
              </td>
              <td className="p-4 text-right">
                <button
                  title="Run Job Now"
                  onClick={() => handleRun(job.id)}
                  className="p-1.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 rounded-lg transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobSchedulerTable;
