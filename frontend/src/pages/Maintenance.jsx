import React, { useEffect, useState } from 'react';
import useMaintenanceStore from '../store/maintenanceStore';
import AssetToolbar from '../components/assets/AssetToolbar';
import { Hammer, CheckCircle, Clock, Calendar, Plus, Ban, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Maintenance = () => {
  const navigate = useNavigate();
  const { records, fetchRecords, updateRecord, deleteRecord, loading } = useMaintenanceStore();
  const [activeTab, setActiveTab] = useState('maintenance');

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCloseMaintenance = async (id, status) => {
    try {
      await updateRecord(id, { status });
      await fetchRecords();
    } catch (e) {
      alert('Failed to update maintenance: ' + e.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      SCHEDULED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      CANCELLED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Asset Maintenance Desk</h1>
          <p className="text-sm text-zinc-400">Schedule hardware diagnostics, recalibrations, or replacement logs.</p>
        </div>
      </div>

      <AssetToolbar activeTab={activeTab} onTabChange={(tab) => {
        if (tab === 'inventory') navigate('/assets');
        else if (tab === 'vendors') navigate('/vendors');
        else setActiveTab(tab);
      }} />

      <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-xl">
        <table className="min-w-full divide-y divide-zinc-850">
          <thead>
            <tr className="bg-zinc-950/40 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="px-6 py-4">Asset Tag</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Cost ($)</th>
              <th className="px-6 py-4">Scheduled Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850 text-sm text-zinc-300">
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-zinc-850/40 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-zinc-100">{rec.asset?.tag}</td>
                <td className="px-6 py-4 font-medium text-zinc-200">
                  <div className="font-semibold">{rec.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{rec.description || 'No description provided'}</div>
                </td>
                <td className="px-6 py-4 font-mono font-semibold">${rec.cost.toLocaleString()}</td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                  {new Date(rec.scheduledDate).toLocaleString()}
                </td>
                <td className="px-6 py-4">{getStatusBadge(rec.status)}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  {rec.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleCloseMaintenance(rec.id, 'IN_PROGRESS')}
                      className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500 hover:text-white transition-all"
                    >
                      Start
                    </button>
                  )}
                  {rec.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleCloseMaintenance(rec.id, 'COMPLETED')}
                      className="px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      Complete
                    </button>
                  )}
                  {rec.status !== 'COMPLETED' && rec.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCloseMaintenance(rec.id, 'CANCELLED')}
                      title="Cancel Job"
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-rose-400 transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-zinc-500 italic">
                  No active maintenance tickets scheduled.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Maintenance;
