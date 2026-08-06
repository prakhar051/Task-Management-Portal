import React from 'react';

const AssetCard = ({ title, value, icon: Icon, description, trend, trendColor = 'text-emerald-400' }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:shadow-xl hover:shadow-black/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <div className="p-2.5 bg-zinc-800 rounded-lg text-zinc-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-zinc-100">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-zinc-500">{description}</p>
      )}
    </div>
  );
};

export default AssetCard;
