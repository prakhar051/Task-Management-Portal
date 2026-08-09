import React from 'react';
import useSocketStore from '../../store/socketStore';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const isConnected = useSocketStore((state) => state.isConnected);

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono">
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          isConnected ? 'bg-emerald-400' : 'bg-rose-400'
        }`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isConnected ? 'bg-emerald-500' : 'bg-rose-500'
        }`} />
      </span>
      <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
        {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
      </span>
    </div>
  );
};

export default ConnectionStatus;
