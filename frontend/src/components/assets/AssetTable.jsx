import React from 'react';
import { Eye, ArrowRightLeft, UserCheck, ShieldAlert, Hammer } from 'lucide-react';

const AssetTable = ({ assets, onViewDetails, onAssign, onTransfer, onMaintenance }) => {
  const getStatusBadge = (status) => {
    const styles = {
      AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      ASSIGNED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      UNDER_MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      LOST: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      DAMAGED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      RETIRED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || ''}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getConditionColor = (cond) => {
    const colors = {
      NEW: 'text-emerald-400',
      GOOD: 'text-blue-400',
      FAIR: 'text-amber-400',
      POOR: 'text-rose-400',
      DAMAGED: 'text-rose-600 font-bold'
    };
    return colors[cond] || 'text-zinc-400';
  };

  return (
    <div className="overflow-x-auto w-full bg-zinc-900 border border-zinc-800 rounded-xl">
      <table className="min-w-full divide-y divide-zinc-850">
        <thead>
          <tr className="bg-zinc-950/40 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <th className="px-6 py-4">Asset Tag</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Condition</th>
            <th className="px-6 py-4">Assignee</th>
            <th className="px-6 py-4">Purchase Price</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850 text-sm text-zinc-300">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-zinc-850/40 transition-colors">
              <td className="px-6 py-4 font-mono font-bold text-zinc-100">{asset.tag}</td>
              <td className="px-6 py-4 font-medium">{asset.name}</td>
              <td className="px-6 py-4 text-zinc-400">{asset.category?.name || 'General'}</td>
              <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
              <td className="px-6 py-4 font-medium uppercase text-xs">
                <span className={getConditionColor(asset.condition)}>{asset.condition}</span>
              </td>
              <td className="px-6 py-4 text-zinc-400">
                {asset.currentEmployee ? (
                  <span className="text-zinc-200">
                    {asset.currentEmployee.firstName} {asset.currentEmployee.lastName}
                  </span>
                ) : (
                  <span className="text-zinc-500 italic">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4 font-semibold text-zinc-100">${asset.purchasePrice.toLocaleString()}</td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onViewDetails(asset.id)}
                  title="View Details"
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {asset.status === 'AVAILABLE' && (
                  <button
                    onClick={() => onAssign(asset)}
                    title="Assign Asset"
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/20"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                )}

                {asset.status === 'ASSIGNED' && (
                  <button
                    onClick={() => onTransfer(asset)}
                    title="Transfer Asset"
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                )}

                {asset.status !== 'RETIRED' && asset.status !== 'UNDER_MAINTENANCE' && (
                  <button
                    onClick={() => onMaintenance(asset)}
                    title="Schedule Maintenance"
                    className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white transition-colors border border-amber-500/20"
                  >
                    <Hammer className="w-4 h-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr>
              <td colSpan="8" className="px-6 py-12 text-center text-zinc-500 italic">
                No inventory assets found matching the filter criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
