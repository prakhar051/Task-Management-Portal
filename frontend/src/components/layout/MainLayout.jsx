import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import useSocketStore from '../../store/socketStore';
import useAdminStore from '../../store/adminStore';
import MaintenanceBanner from '../admin/MaintenanceBanner';
import ConnectionStatus from '../realtime/ConnectionStatus';
import OnlineUsers from '../realtime/OnlineUsers';
import RealtimeToast from '../realtime/RealtimeToast';
import RealtimeListener from '../realtime/RealtimeListener';
import NotificationBell from '../notifications/NotificationBell';

export default function MainLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user) || { name: 'Employee', role: 'EMPLOYEE' };
  const accessToken = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const connectSocket = useSocketStore((state) => state.connect);
  const disconnectSocket = useSocketStore((state) => state.disconnect);

  const maintenanceConfig = useAdminStore((state) => state.maintenanceConfig);
  const fetchMaintenanceConfig = useAdminStore((state) => state.fetchMaintenanceConfig);

  useEffect(() => {
    fetchMaintenanceConfig();
  }, [fetchMaintenanceConfig]);

  useEffect(() => {
    if (accessToken) {
      connectSocket(accessToken);
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Employees', path: '/employees', icon: '👥', roles: ['ADMIN', 'MANAGER', 'HR'] },
    { name: 'Departments', path: '/departments', icon: '🏢', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Projects', path: '/projects', icon: '📂', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Tasks', path: '/tasks', icon: '📋', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Activity Logs', path: '/activity', icon: '📜', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Analytics', path: '/analytics', icon: '📈', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Reports', path: '/reports', icon: '📥', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Calendar', path: '/calendar', icon: '📅', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Leave Management', path: '/leaves', icon: '🌴', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Attendance', path: '/attendance', icon: '⏰', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Timesheets', path: '/timesheets', icon: '📝', roles: ['ADMIN', 'MANAGER', 'HR'] },
    { name: 'Documents', path: '/documents', icon: '📂', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Salary Structures', path: '/salary-structures', icon: '💳', roles: ['ADMIN', 'HR'] },
    { name: 'Payroll Runs', path: '/payroll', icon: '⚙️', roles: ['ADMIN', 'HR'] },
    { name: 'My Payslips', path: '/payslips', icon: '🧾', roles: ['EMPLOYEE'] },
    { name: 'Recruitment', path: '/recruitment', icon: '🎯', roles: ['ADMIN', 'MANAGER', 'HR'] },
    { name: 'Assets & Inventory', path: '/assets', icon: '🏷️', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'AI Assistant', path: '/ai-assistant', icon: '🤖', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Knowledge Base', path: '/knowledge', icon: '📚', roles: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR'] },
    { name: 'Automation Center', path: '/automation', icon: '⚙️', roles: ['ADMIN', 'MANAGER', 'HR'] },
    { name: 'Admin Dashboard', path: '/admin', icon: '🛠️', roles: ['ADMIN'] },
    { name: 'Organization Settings', path: '/organization-settings', icon: '🏢', roles: ['ADMIN'] },
    { name: 'Feature Flags', path: '/feature-flags', icon: '🚩', roles: ['ADMIN'] },
    { name: 'Email Settings', path: '/email-settings', icon: '📧', roles: ['ADMIN'] },
    { name: 'Storage Settings', path: '/storage-settings', icon: '💾', roles: ['ADMIN'] },
    { name: 'Backup Manager', path: '/backup-manager', icon: '📦', roles: ['ADMIN'] },
    { name: 'Job Scheduler', path: '/job-scheduler', icon: '⏰', roles: ['ADMIN'] },
    { name: 'Health Monitoring', path: '/monitoring', icon: '📈', roles: ['ADMIN'] },
    { name: 'System Logs', path: '/system-logs', icon: '📜', roles: ['ADMIN'] },
    { name: 'Error Logs', path: '/error-logs', icon: '🚨', roles: ['ADMIN'] },
    { name: 'Maintenance Mode', path: '/maintenance-mode', icon: '🛠️', roles: ['ADMIN'] }
  ].filter((link) => link.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-slateDark-950 text-slateDark-100 select-none">
      {/* Sidebar navigation panel */}
      <aside className="w-64 glass border-r border-slateDark-800 flex flex-col justify-between hidden md:flex animate-fade-in">
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
          <Link
            to={`/employees/${user.employeeId || user.id}`}
            className="flex items-center space-x-3 px-2 py-1.5 rounded-lg hover:bg-slateDark-900 transition-colors w-full text-left cursor-pointer group"
          >
            <div className="w-10 h-10 bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center rounded-full border border-brand-500/30 group-hover:border-brand-400 transition-colors">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight group-hover:text-brand-400 transition-colors">
                {user.name}
              </div>
              <div className="text-xs text-slateDark-400 font-semibold uppercase tracking-wider mt-0.5">
                {user.role}
              </div>
            </div>
          </Link>

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
        <MaintenanceBanner config={maintenanceConfig} />
        {/* Top Header Bar */}
        <header className="h-20 border-b border-slateDark-900 px-8 flex items-center justify-between glass z-20">
          <div className="flex items-center md:hidden space-x-3">
            <span className="text-2xl">🎯</span>
            <span className="font-extrabold text-white text-lg tracking-wider">TASKPORTAL</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <ConnectionStatus />
            <OnlineUsers />
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Link to={`/employees/${user.employeeId || user.id}`} className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white md:hidden">
              {user.name.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto relative">
          <Outlet />
          <RealtimeToast />
          <RealtimeListener />
        </main>
      </div>
    </div>
  );
}
