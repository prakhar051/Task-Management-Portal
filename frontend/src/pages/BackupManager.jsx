import React, { useEffect, useState } from 'react';
import useBackupStore from '../store/backupStore';
import BackupTable from '../components/admin/BackupTable';
import { Archive, Plus, RefreshCw } from 'lucide-react';

const BackupManager = () => {
  const backups = useBackupStore((state) => state.backups);
  const fetchBackups = useBackupStore((state) => state.fetchBackups);
  const createBackup = useBackupStore((state) => state.createBackup);
  const restoreBackup = useBackupStore((state) => state.restoreBackup);

  const [scope, setScope] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createBackup(scope);
      alert('System backup initiated in background. Refreshing in a moment...');
      setTimeout(() => fetchBackups(), 4000);
    } catch (err) {
      alert('Failed to trigger backup process.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('Restore system state from this backup archive? This may overwrite files.')) {
      try {
        await restoreBackup(id);
        alert('Restore sequence successfully initiated!');
      } catch (err) {
        alert('Restore failed.');
      }
    }
  };

  return (
    <div className="space-y-6 text-left select-none max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Archive className="w-6 h-6 text-brand-400" />
            <span>Database Backup & Restore Manager</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Generate offline zip archives, package uploads documents, and restore system state.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="px-4 py-2.5 bg-zinc-950 border border-zinc-900 text-white rounded-xl text-xs focus:outline-none"
          >
            <option value="ALL">Full Backup (All)</option>
            <option value="DATABASE">Database Only</option>
            <option value="UPLOADS">Uploads Only</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Trigger Backup</span>
          </button>
        </div>
      </div>

      <BackupTable backups={backups} onRestore={handleRestore} />
    </div>
  );
};

export default BackupManager;
