import React from 'react';
import { useAuthStore } from '../../store/authStore';
import ProgressBar from './ProgressBar';

export default function ProjectCard({ project, onAssignManagerClick }) {
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const managerName = project.manager
    ? `${project.manager.firstName} ${project.manager.lastName}`
    : 'Unassigned';

  const getAvatarPath = (path) => {
    if (!path) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  return (
    <div className="glass rounded-2xl border border-slateDark-800 p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 select-none">
      {/* Glow highlight */}
      <div className="absolute -left-12 -top-12 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl" />

      {/* Left Manager Column */}
      <div className="flex flex-col items-center justify-center p-6 bg-slateDark-900/40 border border-slateDark-850 rounded-2xl min-w-[220px] text-center">
        <span className="text-xs font-semibold text-slateDark-400 uppercase tracking-wider block mb-4">
          Project Manager
        </span>

        {project.manager ? (
          <div className="space-y-3">
            {project.manager.avatar ? (
              <img
                src={getAvatarPath(project.manager.avatar)}
                alt={managerName}
                className="w-20 h-20 rounded-full object-cover border border-slateDark-800 mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-black flex items-center justify-center text-2xl mx-auto uppercase">
                {project.manager.firstName.charAt(0)}
                {project.manager.lastName.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-extrabold text-white text-base leading-snug">{managerName}</h4>
              <span className="text-xs text-slateDark-550 block truncate max-w-[190px] mt-0.5">
                {project.manager.email}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-4">
            <div className="w-20 h-20 rounded-full bg-slateDark-850 flex items-center justify-center text-3xl mx-auto opacity-40">
              👤
            </div>
            <p className="text-xs font-semibold text-slateDark-500 italic">No manager assigned</p>
          </div>
        )}

        {currentUser.role === 'ADMIN' && (
          <button
            onClick={onAssignManagerClick}
            className="mt-6 px-4 py-2 text-xs font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-lg transition-colors duration-200"
          >
            {project.manager ? 'Change Manager' : 'Assign Manager'}
          </button>
        )}
      </div>

      {/* Right Details Panel */}
      <div className="flex-1 space-y-6">
        <div>
          <span className="font-mono text-xs text-brand-400 tracking-widest font-black uppercase">
            {project.code}
          </span>
          <h2 className="text-3xl font-extrabold text-white leading-tight mt-1">{project.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slateDark-900 border border-slateDark-800 text-slateDark-300">
              Dept: {project.department?.name}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20 text-brand-400">
              Priority: {project.priority}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slateDark-900 border border-slateDark-800 text-slateDark-400 uppercase">
              Status: {project.status}
            </span>
          </div>
        </div>

        {project.description && (
          <p className="text-slateDark-300 text-sm leading-relaxed max-w-2xl">
            {project.description}
          </p>
        )}

        {/* Progress and budget stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slateDark-900 pt-6">
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">
              Project Progress
            </span>
            <ProgressBar progress={project.progress} />
          </div>

          <div className="space-y-1">
            <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">
              Budget Allocation
            </span>
            <span className="text-lg font-black text-white block mt-0.5">
              {project.budget ? `$${project.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
