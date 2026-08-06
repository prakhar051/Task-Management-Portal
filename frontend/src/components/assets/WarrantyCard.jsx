import React from 'react';
import { ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';

const WarrantyCard = ({ expiryDate }) => {
  if (!expiryDate) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center text-zinc-500 italic">
        <ShieldAlert className="w-8 h-8 text-zinc-600 mb-2" />
        No warranty tracking information registered for this asset.
      </div>
    );
  }

  const exp = new Date(expiryDate);
  const diffTime = exp.getTime() - Date.now();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffDays < 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Warranty Status</span>
          <h3 className={`text-lg font-bold mt-1 ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isExpired ? 'Expired' : 'Active Coverage'}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg ${isExpired ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {isExpired ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-6 flex items-center space-x-3 text-sm text-zinc-300">
        <Calendar className="w-4 h-4 text-zinc-500" />
        <span>Expiry Date: <strong className="text-zinc-100">{exp.toLocaleDateString()}</strong></span>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-850">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-400">Days Remaining:</span>
          <span className={`font-mono font-bold text-sm ${isExpired ? 'text-rose-500' : diffDays <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isExpired ? `${Math.abs(diffDays)} days ago` : `${diffDays} days`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WarrantyCard;
