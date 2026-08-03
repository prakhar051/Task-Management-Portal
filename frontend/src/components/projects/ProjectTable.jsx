import React from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { useAuthStore } from '../../store/authStore';
import ProgressBar from './ProgressBar';

export default function ProjectTable({ onEdit }) {
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const {
    projects,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    deleteProject,
    restoreProject,
    filters
  } = useProjectStore();

  const handleSingleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to soft delete project: ${name}?`)) {
      const res = await deleteProject(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const handleSingleRestore = async (id, name) => {
    if (window.confirm(`Are you sure you want to restore project: ${name}?`)) {
      const res = await restoreProject(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  const getPriorityBadge = (priority) => {
    const classes = {
      LOW: 'text-slateDark-400 bg-slateDark-900 border-slateDark-800',
      MEDIUM: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20'
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${classes[priority] || classes.MEDIUM}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const classes = {
      PLANNING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      ON_HOLD: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      COMPLETED: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20'
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase ${classes[status] || classes.PLANNING}`}>
        {status}
      </span>
    );
  };

  const isTrashMode = filters.isDeleted === 'true';

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slateDark-800 rounded-2xl glass select-none">
        <div className="text-4xl mb-4">📂</div>
        <h4 className="text-white font-bold text-sm">No Projects Found</h4>
        <p className="text-slateDark-400 text-xs mt-1 max-w-xs">
          {isTrashMode ? 'The archive directory is clean.' : 'Add new project tracks to begin organizing your workflow.'}
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-slateDark-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slateDark-900/60 border-b border-slateDark-850 text-xs font-bold text-slateDark-300 uppercase select-none">
              {currentUser.role === 'ADMIN' && (
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={projects.every((p) => selectedIds.includes(p.id))}
                    onChange={toggleSelectAll}
                    className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-4">Project Code</th>
              <th className="p-4">Name</th>
              <th className="p-4">Department</th>
              <th className="p-4">Manager</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Progress</th>
              <th className="p-4">Timeline</th>
              <th className="p-4 text-center">Members</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900 text-sm">
            {projects.map((proj) => {
              const isSelected = selectedIds.includes(proj.id);
              const managerName = proj.manager
                ? `${proj.manager.firstName} ${proj.manager.lastName}`
                : 'Unassigned';

              const start = new Date(proj.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const end = new Date(proj.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

              return (
                <tr key={proj.id} className="hover:bg-slateDark-900/20 transition-colors">
                  {currentUser.role === 'ADMIN' && (
                    <td className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(proj.id)}
                        className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Code */}
                  <td className="p-4 font-mono text-xs font-bold text-slateDark-400 select-all uppercase">
                    <Link
                      to={`/projects/${proj.id}`}
                      className="text-brand-400 hover:underline"
                    >
                      {proj.code}
                    </Link>
                  </td>

                  {/* Name */}
                  <td className="p-4 font-bold text-white max-w-[150px] truncate" title={proj.name}>
                    <Link to={`/projects/${proj.id}`} className="hover:text-brand-400 transition-colors">
                      {proj.name}
                    </Link>
                  </td>

                  {/* Department */}
                  <td className="p-4 text-slateDark-300 font-semibold">{proj.department?.name}</td>

                  {/* Manager */}
                  <td className="p-4">
                    {proj.manager ? (
                      <span className="text-slateDark-200 font-semibold">{managerName}</span>
                    ) : (
                      <span className="text-slateDark-500 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="p-4">{getPriorityBadge(proj.priority)}</td>

                  {/* Status */}
                  <td className="p-4">{getStatusBadge(proj.status)}</td>

                  {/* Progress */}
                  <td className="p-4">
                    <ProgressBar progress={proj.progress} />
                  </td>

                  {/* Timeline */}
                  <td className="p-4 text-xs font-semibold text-slateDark-400 whitespace-nowrap">
                    {start} - {end}
                  </td>

                  {/* Members */}
                  <td className="p-4 text-center font-mono font-bold text-slateDark-300">
                    {proj._count?.members || 0}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/projects/${proj.id}`}
                        className="px-2 py-1.5 rounded-lg border border-slateDark-800 hover:bg-slateDark-850 hover:text-white transition-colors text-xs font-semibold"
                        title="View Details"
                      >
                        📄 View
                      </Link>

                      {currentUser.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => onEdit(proj)}
                            className="px-2 py-1.5 rounded-lg border border-slateDark-800 hover:bg-slateDark-850 hover:text-brand-400 transition-colors text-xs font-semibold"
                            title="Edit Project"
                          >
                            ✏️ Edit
                          </button>

                          {isTrashMode ? (
                            <button
                              onClick={() => handleSingleRestore(proj.id, proj.name)}
                              className="px-2 py-1.5 rounded-lg border border-brand-500/10 text-brand-400 hover:bg-brand-500/10 transition-colors text-xs font-semibold"
                              title="Restore"
                            >
                              ♻️ Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSingleDelete(proj.id, proj.name)}
                              className="px-2 py-1.5 rounded-lg border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
                              title="Delete"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
