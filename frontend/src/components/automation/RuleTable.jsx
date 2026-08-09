import React from 'react';
import useAutomationStore from '../../store/automationStore';
import { Play, Edit2, Trash2 } from 'lucide-react';

const RuleTable = ({ rules, onEditRule }) => {
  const deleteRule = useAutomationStore((state) => state.deleteRule);
  const runRule = useAutomationStore((state) => state.runRule);

  const handleManualRun = async (id) => {
    try {
      await runRule(id);
      alert('Automation rule manually triggered successfully!');
    } catch (err) {
      alert('Failed to trigger automation rule.');
    }
  };

  return (
    <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl overflow-hidden select-none">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            <th className="p-4">Rule Name</th>
            <th className="p-4">Trigger</th>
            <th className="p-4">Action</th>
            <th className="p-4">Status</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900 text-xs">
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-zinc-900/10 transition-colors text-zinc-300">
              <td className="p-4 font-bold text-white">{rule.title}</td>
              <td className="p-4 font-mono text-[10px] text-brand-400">{rule.trigger}</td>
              <td className="p-4 font-mono text-[10px] text-zinc-400">{rule.action}</td>
              <td className="p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  rule.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-900'
                }`}>
                  {rule.status}
                </span>
              </td>
              <td className="p-4 text-right space-x-2">
                <button
                  title="Run rule manually"
                  onClick={() => handleManualRun(rule.id)}
                  className="p-1.5 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 rounded-lg transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
                <button
                  title="Edit rule settings"
                  onClick={() => onEditRule(rule)}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  title="Delete rule"
                  onClick={() => {
                    if (window.confirm('Delete this automation rule?')) {
                      deleteRule(rule.id);
                    }
                  }}
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
          {rules.length === 0 && (
            <tr>
              <td colSpan={5} className="p-8 text-center text-zinc-500 italic">
                No automation rules configured yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RuleTable;
