import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

export default function DashboardHeader({ onSearch }) {
  const user = useAuthStore((state) => state.user) || { name: 'Guest', role: 'EMPLOYEE' };
  const [searchTerm, setSearchTerm] = useState('');

  // Implement debounced search behavior (wait 400ms before triggering onSearch)
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slateDark-900 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>{getGreeting()}, {user.name}</span>
          <span className="text-brand-400 text-xs px-2 py-0.5 bg-brand-500/10 rounded-full border border-brand-500/20 font-mono tracking-widest uppercase">
            {user.role}
          </span>
        </h1>
        <p className="text-slateDark-400 text-sm mt-1">{getFormattedDate()}</p>
      </div>

      <div className="w-full md:w-80 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects, tasks..."
          className="w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white placeholder-slateDark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
        />
        <span className="absolute right-3 top-3 text-slateDark-500 text-sm select-none">
          🔍
        </span>
      </div>
    </div>
  );
}
