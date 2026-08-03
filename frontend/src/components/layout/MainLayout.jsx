import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const navigate = useNavigate();
  const sessionUser = JSON.parse(localStorage.getItem('user_session')) || { name: 'Admin', role: 'ADMIN' };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Employees', path: '#employees', icon: '👥' },
    { name: 'Departments', path: '#departments', icon: '🏢' },
    { name: 'Projects', path: '#projects', icon: '📂' },
    { name: 'Tasks', path: '#tasks', icon: '📋' }
  ];

  return (
    <div className="min-h-screen flex bg-slateDark-950 text-slateDark-100">
      {/* Sidebar navigation panel */}
      <aside className="w-64 glass border-r border-slateDark-800 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Sidebar Header / Logo */}
          <div className="h-20 flex items-center px-8 border-b border-slateDark-900 space-x-3">
            <span className="text-2xl">🎯</span>
            <span className="font-extrabold text-white text-lg tracking-wider">TASKPORTAL</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slateDark-900 hover:text-white transition-all text-sm font-semibold group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User context footer */}
        <div className="p-4 border-t border-slateDark-900 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-10 h-10 bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center rounded-full border border-brand-500/30">
              {sessionUser.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">{sessionUser.name}</div>
              <div className="text-xs text-slateDark-400 font-semibold uppercase tracking-wider mt-0.5">{sessionUser.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-slateDark-800 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-slateDark-400 text-sm font-semibold transition-all"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        <header className="h-20 border-b border-slateDark-900 px-8 flex items-center justify-between glass z-20">
          <div className="flex items-center md:hidden space-x-3">
            <span className="text-2xl">🎯</span>
            <span className="font-extrabold text-white text-lg tracking-wider">TASKPORTAL</span>
          </div>
          <div className="hidden md:flex items-center text-sm font-semibold text-slateDark-400">
            <span>Server Time Status:</span>
            <span className="text-emerald-500 ml-2 font-mono flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-2" />
              Online
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slateDark-400 hover:text-white rounded-lg hover:bg-slateDark-900 transition-colors">
              🔔
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white md:hidden">
              {sessionUser.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
