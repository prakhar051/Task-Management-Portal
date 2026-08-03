import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AuthLayout({ children }) {
  const { isAuthenticated } = useAuthStore();

  // If the session is already established, bypass auth pages and redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slateDark-950 text-slateDark-100">
      {/* Visual background cards - Hidden on mobile viewports */}
      <div className="hidden lg:flex w-1/2 bg-slateDark-900 border-r border-slateDark-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Gradients */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-md relative z-10 space-y-6">
          <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-xl border border-brand-500/20 text-brand-400">
            🎯
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Coordinate Team Deliverables in Real-Time
          </h1>
          <p className="text-slateDark-400 leading-relaxed text-sm">
            Our unified task workspace organizes projects, aggregates productivity analytics, logs compliance activity audits, and maintains secure role authorization channels.
          </p>
          <div className="p-6 glass rounded-2xl flex items-center space-x-4">
            <div className="text-2xl">⚡</div>
            <div>
              <div className="text-white font-bold text-sm">Built-in Session Rotation</div>
              <div className="text-slateDark-400 text-xs mt-1">Dual token refresh guards secure your data against session leaks.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Render Auth Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background blobs for mobile backdrop visual variety */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-500/5 rounded-full blur-3xl lg:hidden" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl lg:hidden" />
        
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
