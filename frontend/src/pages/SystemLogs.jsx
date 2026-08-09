import React, { useEffect, useState } from 'react';
import useMonitoringStore from '../store/monitoringStore';
import LogViewer from '../components/admin/LogViewer';
import { Terminal, RefreshCw } from 'lucide-react';

const SystemLogs = () => {
  const logs = useMonitoringStore((state) => state.logs);
  const fetchLogs = useMonitoringStore((state) => state.fetchLogs);

  const [level, setLevel] = useState('');
  const [module, setModule] = useState('');

  useEffect(() => {
    fetchLogs({ level, module });
  }, [level, module, fetchLogs]);

  return (
    <div className="space-y-6 text-left select-none max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Terminal className="w-6 h-6 text-brand-400" />
            <span>Centralized System Log Streams</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Audit system actions, trace operational warnings, and search module severity outputs.
          </p>
        </div>

        <button
          onClick={() => fetchLogs({ level, module })}
          className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="flex flex-wrap gap-4 bg-zinc-950/40 p-4 border border-zinc-900 rounded-2xl text-xs">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Severity Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="block w-40 px-4 py-2.5 bg-zinc-950 border border-zinc-900 text-white rounded-xl focus:outline-none"
          >
            <option value="">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
            <option value="DEBUG">Debug</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Module Code</label>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="block w-40 px-4 py-2.5 bg-zinc-950 border border-zinc-900 text-white rounded-xl focus:outline-none"
          >
            <option value="">All Modules</option>
            <option value="SYSTEM">System core</option>
            <option value="AUTH">Auth controller</option>
            <option value="PAYROLL">Payroll workflow</option>
            <option value="SCHEDULER">Scheduler engine</option>
          </select>
        </div>
      </div>

      <LogViewer logs={logs} />
    </div>
  );
};

export default SystemLogs;
