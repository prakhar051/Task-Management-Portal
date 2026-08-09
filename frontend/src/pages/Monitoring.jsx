import React, { useEffect } from 'react';
import useMonitoringStore from '../store/monitoringStore';
import HealthCard from '../components/admin/HealthCard';
import MetricCard from '../components/admin/MetricCard';
import { Activity, RefreshCw, Cpu, Database } from 'lucide-react';

const Monitoring = () => {
  const health = useMonitoringStore((state) => state.health);
  const metricsHistory = useMonitoringStore((state) => state.metricsHistory);
  const fetchHealth = useMonitoringStore((state) => state.fetchHealth);
  const fetchMetricsHistory = useMonitoringStore((state) => state.fetchMetricsHistory);

  useEffect(() => {
    fetchHealth();
    fetchMetricsHistory();

    const interval = setInterval(() => {
      fetchHealth();
      fetchMetricsHistory();
    }, 15000); // refresh every 15s

    return () => clearInterval(interval);
  }, [fetchHealth, fetchMetricsHistory]);

  return (
    <div className="space-y-6 text-left select-none max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Activity className="w-6 h-6 text-brand-400" />
            <span>Health & Diagnostics Monitor</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Realtime operating system charts, CPU loads, RAM allocation history, and response delays.
          </p>
        </div>

        <button
          onClick={() => {
            fetchHealth();
            fetchMetricsHistory();
          }}
          className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Connectivity snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HealthCard title="PostgreSQL Service" status={health?.dbStatus} type="db" />
        <HealthCard title="SMTP Connection" status={health?.smtpStatus} type="smtp" />
        <HealthCard title="WebSockets Gateway" status={health?.socketStatus} type="socket" />
        <HealthCard title="Uptime Counter" status={health ? `${Math.floor(health.uptime / 60)}m` : 'N/A'} type="uptime" />
      </div>

      {/* Resource snapshots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Processor Usage" value={health?.cpuUsage ?? 0} unit="%" type="cpu" />
        <MetricCard title="Memory Allocation" value={health?.memoryUsage ?? 0} unit="%" type="memory" />
        <MetricCard title="Disk Partition" value={health?.diskUsage ?? 0} unit="%" type="disk" />
      </div>

      {/* Latency metric history timeline list */}
      <div className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-zinc-900 pb-2">
          <Database className="w-4 h-4 text-brand-400" />
          <span>Server Response Latency History</span>
        </h3>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {metricsHistory.map((snap) => (
            <div key={snap.id} className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-[10px] text-zinc-400">
              <span className="text-zinc-500">{new Date(snap.createdAt).toLocaleString()}</span>
              <div className="flex space-x-6">
                <span>CPU: <strong className="text-white">{snap.cpuUsage}%</strong></span>
                <span>RAM: <strong className="text-white">{snap.memoryUsage}%</strong></span>
                <span>Latency: <strong className="text-brand-400">{snap.responseTime} ms</strong></span>
              </div>
            </div>
          ))}
          {metricsHistory.length === 0 && (
            <div className="text-center py-4 text-xs text-zinc-500 italic">Gathering latency parameters snapshots...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
