import React from 'react';
import { Database, HardDrive, RefreshCw } from 'lucide-react';

const BackupTable = ({ backups, onRestore }) => {
  const getScopeIcon = (scope) => {
    if (scope === 'DATABASE') return <Database className="w-4 h-4 text-brand-400" />;
    return <HardDrive className="w-4 h-4 text-emerald-400" />;
  };

  const formatSize = (bytesStr) => {
    const bytes = parseInt(bytesStr) || 0;
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl overflow-hidden select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <th className="p-4">Archive Filename</th>
            <th className="p-4">Backup Type</th>
            <th className="p-4">Scope</th>
            <th className="p-4">Size</th>
            <th className="p-4">Status</th>
            <th className="p-4">Timestamp</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900 text-xs">
          {backups.map((backup) => (
            <tr key={backup.id} className="hover:bg-zinc-900/10 transition-colors text-zinc-300">
              <td className="p-4 font-bold text-white max-w-xs truncate" title={backup.filename}>
                {backup.filename}
              </td>
              <td className="p-4">
                <span className="px-2 py-0.5 bg-zinc-900 text-[10px] text-zinc-400 rounded-md font-semibold border border-zinc-800">
                  {backup.backupType}
                </span>
              </td>
              <td className="p-4 flex items-center space-x-2">
                {getScopeIcon(backup.scope)}
                <span className="font-semibold text-zinc-400">{backup.scope}</span>
              </td>
              <td className="p-4 text-zinc-500 font-mono text-[10px]">{formatSize(backup.sizeBytes)}</td>
              <td className="p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  backup.status === 'SUCCESS'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : backup.status === 'FAILED'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 animate-pulse'
                }`}>
                  {backup.status}
                </span>
              </td>
              <td className="p-4 text-zinc-500 font-mono text-[10px]">
                {new Date(backup.createdAt).toLocaleString()}
              </td>
              <td className="p-4 text-right">
                <button
                  disabled={backup.status !== 'SUCCESS'}
                  onClick={() => onRestore(backup.id)}
                  className="flex items-center space-x-1 ml-auto px-3 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
              </td>
            </tr>
          ))}
          {backups.length === 0 && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-zinc-500 italic">
                No backup archives recorded in history logs.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BackupTable;
