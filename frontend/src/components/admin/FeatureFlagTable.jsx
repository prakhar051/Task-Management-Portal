import React from 'react';
import useFeatureFlagStore from '../../store/featureFlagStore';
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

const FeatureFlagTable = ({ flags, onToggleStatus }) => {
  const deleteFlag = useFeatureFlagStore((state) => state.deleteFlag);

  return (
    <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl overflow-hidden select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <th className="p-4">Flag Key</th>
            <th className="p-4">Description</th>
            <th className="p-4">Target Environment</th>
            <th className="p-4">Visibility Roles</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900 text-xs">
          {flags.map((flag) => (
            <tr key={flag.id} className="hover:bg-zinc-900/10 transition-colors text-zinc-300">
              <td className="p-4 font-mono font-bold text-brand-400">{flag.key}</td>
              <td className="p-4 text-zinc-400 max-w-xs truncate">{flag.description || 'N/A'}</td>
              <td className="p-4 font-mono text-[10px] text-zinc-500">{flag.environment || 'ALL'}</td>
              <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  {flag.roles && flag.roles.length > 0 ? (
                    flag.roles.map((r, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-zinc-900 text-[9px] font-bold text-zinc-400 rounded">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic text-[10px]">All Roles</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <button
                  onClick={() => onToggleStatus(flag)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold transition-all ${
                    flag.status === 'ENABLED'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-900 text-zinc-500'
                  }`}
                >
                  {flag.status === 'ENABLED' ? (
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
                  onClick={() => {
                    if (window.confirm(`Delete feature flag "${flag.key}"?`)) {
                      deleteFlag(flag.id);
                    }
                  }}
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
          {flags.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-zinc-500 italic">
                No feature flags defined in the registry.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FeatureFlagTable;
