import React from 'react';
import { Database, Server, Mail, HardDrive, Cpu } from 'lucide-react';

const HealthCard = ({ title, status, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'db':
        return <Database className="w-5 h-5" />;
      case 'smtp':
        return <Mail className="w-5 h-5" />;
      case 'storage':
        return <HardDrive className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'UP':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'DOWN':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    }
  };

  return (
    <div className="flex items-center justify-between p-4.5 bg-zinc-950/40 border border-zinc-900 rounded-2xl select-none">
      <div className="flex items-center space-x-3.5">
        <div className={`p-2.5 rounded-xl border ${getStatusColor()}`}>
          {getIcon()}
        </div>
        <div>
          <h4 className="text-xs font-bold text-white">{title}</h4>
          <p className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">System status</p>
        </div>
      </div>
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor()}`}>
        {status || 'UNKNOWN'}
      </span>
    </div>
  );
};

export default HealthCard;
