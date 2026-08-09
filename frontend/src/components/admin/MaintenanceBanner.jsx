import React from 'react';
import { AlertTriangle } from 'lucide-react';

const MaintenanceBanner = ({ config }) => {
  if (!config || config.status !== 'ENABLED') return null;

  return (
    <div className="w-full bg-rose-600 border-b border-rose-700 text-white py-2.5 px-4 flex items-center justify-center space-x-2.5 text-xs font-bold shadow-lg select-none">
      <AlertTriangle className="w-4 h-4 animate-bounce" />
      <span>
        System is currently running in Maintenance Mode. Standard employees access is blocked. 
      </span>
      {config.eta && (
        <span className="font-semibold px-2 py-0.5 bg-rose-800 text-[10px] rounded border border-rose-900/60">
          ETA: {new Date(config.eta).toLocaleString()}
        </span>
      )}
    </div>
  );
};

export default MaintenanceBanner;
