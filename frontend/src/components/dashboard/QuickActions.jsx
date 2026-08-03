import React from 'react';
import { useAuthStore } from '../../store/authStore';

export default function QuickActions() {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };

  const actions = [
    { title: 'New Task', desc: 'Create a new task card', icon: '📝', path: '#tasks', roles: ['ADMIN', 'MANAGER'] },
    { title: 'New Project', desc: 'Initialize new project scope', icon: '📂', path: '#projects', roles: ['ADMIN', 'MANAGER'] },
    { title: 'Add Employee', desc: 'Register a new employee account', icon: '👤', path: '#employees', roles: ['ADMIN'] },
    { title: 'View Reports', desc: 'Check performance reports', icon: '📈', path: '#reports', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'] }
  ];

  const authorizedActions = actions.filter((act) => act.roles.includes(user.role));

  return (
    <div className="glass rounded-xl p-6 border border-slateDark-800">
      <h3 className="font-bold text-sm text-slateDark-300 mb-6 tracking-wide">Quick Operations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {authorizedActions.map((act, index) => (
          <a
            key={index}
            href={act.path}
            className="flex items-center space-x-4 p-4 rounded-xl bg-slateDark-900/60 border border-slateDark-850 hover:bg-brand-500/10 hover:border-brand-500/20 group transition-all duration-200"
          >
            <div className="text-2xl w-10 h-10 rounded-lg bg-slateDark-950 flex items-center justify-center group-hover:scale-105 transition-transform">
              {act.icon}
            </div>
            <div>
              <div className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">{act.title}</div>
              <div className="text-xs text-slateDark-500 mt-0.5">{act.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
