import React from 'react';
import { Tag, Hammer, ShieldCheck, Truck, BarChart3 } from 'lucide-react';

const AssetToolbar = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Asset Inventory', icon: Tag },
    { id: 'maintenance', label: 'Maintenance Log', icon: Hammer },
    { id: 'vendors', label: 'Vendors Directory', icon: Truck }
  ];

  return (
    <div className="flex border-b border-zinc-800 bg-zinc-950/20 p-1 rounded-xl gap-2 w-fit mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              isActive
                ? 'bg-zinc-850 text-white shadow-md'
                : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AssetToolbar;
