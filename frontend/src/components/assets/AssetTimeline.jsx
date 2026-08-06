import React from 'react';
import { Calendar, Tag, ArrowRightLeft, UserCheck, Hammer, HelpCircle } from 'lucide-react';

const AssetTimeline = ({ history = [] }) => {
  const getIcon = (action) => {
    const icons = {
      CREATE: <Tag className="w-4 h-4 text-emerald-400" />,
      ASSIGN: <UserCheck className="w-4 h-4 text-blue-400" />,
      RETURN: <ArrowRightLeft className="w-4 h-4 text-amber-400" />,
      TRANSFER: <ArrowRightLeft className="w-4 h-4 text-indigo-400" />,
      MAINTENANCE: <Hammer className="w-4 h-4 text-rose-400" />
    };
    return icons[action] || <HelpCircle className="w-4 h-4 text-zinc-400" />;
  };

  const getBadgeStyle = (action) => {
    const styles = {
      CREATE: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      ASSIGN: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      RETURN: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      TRANSFER: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      MAINTENANCE: 'bg-rose-500/10 border-rose-500/20 text-rose-400'
    };
    return styles[action] || 'bg-zinc-800 border-zinc-700 text-zinc-300';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-6">Asset Activity Timeline</h3>
      {history.length === 0 ? (
        <p className="text-sm text-zinc-500 italic text-center py-6">No historical activities found for this asset.</p>
      ) : (
        <div className="relative pl-6 border-l border-zinc-800 space-y-6">
          {history.map((item) => (
            <div key={item.id} className="relative">
              {/* Dot marker */}
              <div className="absolute -left-[35px] top-0.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg">
                {getIcon(item.action)}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className={`w-fit px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${getBadgeStyle(item.action)}`}>
                  {item.action}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-300 font-medium">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetTimeline;
