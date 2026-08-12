import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../api/apiClient';

export default function DepartmentCard({ department, onAssignManagerClick }) {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const managerName = department.manager
    ? `${department.manager.firstName} ${department.manager.lastName}`
    : 'Unassigned';

  const getAvatarPath = (path) => {
    if (!path) return null;
    const baseUrl = API_URL.replace(/\/api(\/v1)?\/?$/, '');
    return `${baseUrl}${path}`;
  };

  return (
    <div className="glass rounded-2xl border border-slateDark-800 p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 select-none">
      {/* Decorative gradient streak */}
      <div className="absolute -left-12 -top-12 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl" />

      {/* Left Manager Info Box */}
      <div className="flex flex-col items-center justify-center p-6 bg-slateDark-900/40 border border-slateDark-850 rounded-2xl min-w-[200px] text-center">
        <span className="text-xs font-semibold text-slateDark-400 uppercase tracking-wider block mb-4">
          Department Manager
        </span>

        {department.manager ? (
          <div className="space-y-3">
            {department.manager.avatar ? (
              <img
                src={getAvatarPath(department.manager.avatar)}
                alt={managerName}
                className="w-20 h-20 rounded-full object-cover border border-slateDark-800 mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-black flex items-center justify-center text-2xl mx-auto uppercase select-none">
                {department.manager.firstName.charAt(0)}
                {department.manager.lastName.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-extrabold text-white text-base leading-snug">{managerName}</h4>
              <span className="text-xs text-slateDark-500 block truncate max-w-[170px] mt-0.5">
                {department.manager.email}
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

        {user.role === 'ADMIN' && (
          <button
            onClick={onAssignManagerClick}
            className="mt-6 px-4 py-2 text-xs font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-lg transition-colors duration-200 select-none"
          >
            {department.manager ? 'Change Manager' : 'Assign Manager'}
          </button>
        )}
      </div>

      {/* Right details column */}
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">{department.name}</h2>
          <p className="text-brand-400 font-semibold mt-1.5 flex items-center gap-2 text-sm">
            <span className="font-mono tracking-wider">{department.code}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slateDark-750" />
            <span className="text-slateDark-400 uppercase text-xs tracking-wider">{department.status}</span>
          </p>
        </div>

        {department.description && (
          <p className="text-slateDark-300 text-sm leading-relaxed max-w-xl">
            {department.description}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-slateDark-900 pt-6">
          <div>
            <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">Email Address</span>
            <a href={`mailto:${department.email}`} className="text-white hover:underline text-sm font-semibold mt-1 block">
              {department.email}
            </a>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">Phone Number</span>
            <span className="text-slateDark-200 text-sm font-semibold mt-1 block">{department.phone}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">Office Location</span>
            <span className="text-slateDark-200 text-sm font-semibold mt-1 block">{department.location}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider">Workforce Strength</span>
            <span className="text-slateDark-200 text-sm font-semibold mt-1 block font-mono">
              {department._count?.employees || 0} employees active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
