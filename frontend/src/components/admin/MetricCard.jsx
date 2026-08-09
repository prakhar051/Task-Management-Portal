import React from 'react';
import { Cpu, HardDrive } from 'lucide-react';

const MetricCard = ({ title, value, unit, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'cpu':
        return <Cpu className="w-5 h-5" />;
      case 'disk':
        return <HardDrive className="w-5 h-5" />;
      default:
        return <Cpu className="w-5 h-5" />;
    }
  };

  const numericValue = parseFloat(value) || 0;

  const getProgressColor = () => {
    if (numericValue > 85) return 'bg-rose-500';
    if (numericValue > 60) return 'bg-amber-500';
    return 'bg-brand-500';
  };

  return (
    <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4 select-none">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{title}</h4>
          <div className="text-2xl font-extrabold text-white mt-1">
            <span>{value}</span>
            <span className="text-xs text-zinc-500 font-bold ml-0.5">{unit}</span>
          </div>
        </div>
        <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl">
          {getIcon()}
        </div>
      </div>

      {/* Progress Gauge bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${Math.min(numericValue, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
