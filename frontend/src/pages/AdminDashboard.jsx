import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useMonitoringStore from '../store/monitoringStore';
import useAdminStore from '../store/adminStore';
import HealthCard from '../components/admin/HealthCard';
import MetricCard from '../components/admin/MetricCard';
import { Settings, ShieldAlert, Cpu, Mail, HardDrive, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const health = useMonitoringStore((state) => state.health);
  const fetchHealth = useMonitoringStore((state) => state.fetchHealth);
  const maintenanceConfig = useAdminStore((state) => state.maintenanceConfig);
  const fetchMaintenanceConfig = useAdminStore((state) => state.fetchMaintenanceConfig);

  useEffect(() => {
    fetchHealth();
    fetchMaintenanceConfig();
  }, [fetchHealth, fetchMaintenanceConfig]);

  const adminModules = [
    { name: 'Organization Settings', path: '/organization-settings', icon: '🏢', desc: 'Working hours & company details' },
    { name: 'Feature Flags', path: '/feature-flags', icon: '🚩', desc: 'Enable/disable beta features' },
    { name: 'Email Settings', path: '/email-settings', icon: '📧', desc: 'SMTP configurations & history logs' },
    { name: 'Storage Settings', path: '/storage-settings', icon: '💾', desc: 'Cloud storage bucket credentials' },
    { name: 'Backup Manager', path: '/backup-manager', icon: '📦', desc: 'Database exports & zip backups' },
    { name: 'Job Scheduler', path: '/job-scheduler', icon: '⏰', desc: 'Scheduled cron tasks' },
    { name: 'Health Monitoring', path: '/monitoring', icon: '📈', desc: 'Server RAM/CPU charts & snapshots' },
    { name: 'System Logs', path: '/system-logs', icon: '📜', desc: 'Audit system actions log streams' },
    { name: 'Error Diagnostics', path: '/error-logs', icon: '🚨', desc: 'Trace unresolved stack errors' },
    { name: 'Maintenance Mode', path: '/maintenance-mode', icon: '🛠️', desc: 'Toggle system offline locks' }
  ];

  return (
    <div className="space-y-6 text-left select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Settings className="w-6 h-6 text-brand-400" />
            <span>DevOps & Administration Center</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            System configs dashboard, SMTP checks, backups archives, and health gauges.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {maintenanceConfig?.status === 'ENABLED' && (
        <div className="flex items-start space-x-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold">Maintenance Mode Active</span>: Standard employees are currently blocked. AllowAdmin is: {maintenanceConfig.allowAdmin ? 'True' : 'False'}.
          </div>
        </div>
      )}

      {/* System Status Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HealthCard title="Database Server" status={health?.dbStatus} type="db" />
        <HealthCard title="SMTP Mail Transport" status={health?.smtpStatus} type="smtp" />
        <HealthCard title="WebSockets Gateway" status={health?.socketStatus} type="socket" />
        <HealthCard title="Cloud Storage" status={health?.storageStatus} type="storage" />
      </div>

      {/* Resource Snapshot Gauges row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="CPU Core Usage" value={health?.cpuUsage ?? 0} unit="%" type="cpu" />
        <MetricCard title="Memory Allocation" value={health?.memoryUsage ?? 0} unit="%" type="memory" />
        <MetricCard title="Disk Partition" value={health?.diskUsage ?? 0} unit="%" type="disk" />
      </div>

      {/* Administrative Shortcuts Matrix Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Administration Utilities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminModules.map((mod, idx) => (
            <Link
              key={idx}
              to={mod.path}
              className="p-5 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl flex items-start space-x-4 hover:bg-zinc-900/10 transition-all group"
            >
              <div className="text-2xl p-2 bg-zinc-900 border border-zinc-800 group-hover:border-brand-500/40 rounded-xl shrink-0">
                {mod.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-brand-400 transition-colors">
                  {mod.name}
                </h4>
                <p className="text-[11px] text-zinc-500 font-semibold mt-1 leading-relaxed">{mod.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
