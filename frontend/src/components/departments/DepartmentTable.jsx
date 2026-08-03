import React from 'react';
import { Link } from 'react-router-dom';
import { useDepartmentStore } from '../../store/departmentStore';
import { useAuthStore } from '../../store/authStore';

export default function DepartmentTable({ onEdit }) {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { departments, selectedIds, toggleSelect, toggleSelectAll, deleteDepartment, restoreDepartment, filters } = useDepartmentStore();

  const handleSingleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to soft delete department: ${name}?`)) {
      const result = await deleteDepartment(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleSingleRestore = async (id, name) => {
    if (window.confirm(`Are you sure you want to restore department: ${name}?`)) {
      const result = await restoreDepartment(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      INACTIVE: 'text-red-400 bg-red-500/10 border-red-500/20'
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase select-none ${classes[status] || classes.ACTIVE}`}>
        {status}
      </span>
    );
  };

  const isTrashMode = filters.isDeleted === 'true';

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slateDark-800 rounded-2xl glass select-none">
        <div className="text-4xl mb-4">🏢</div>
        <h4 className="text-white font-bold text-sm">No Departments Registered</h4>
        <p className="text-slateDark-400 text-xs mt-1 max-w-xs">
          {isTrashMode ? 'The archive directory is clean.' : 'Add new departments to begin organizing your team.'}
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
              {user.role === 'ADMIN' && (
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={departments.every((d) => selectedIds.includes(d.id))}
                    onChange={toggleSelectAll}
                    className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-4">Department Name</th>
              <th className="p-4">Code</th>
              <th className="p-4">Manager</th>
              <th className="p-4 text-center">Employees</th>
              <th className="p-4">Status</th>
              <th className="p-4 hidden md:table-cell">Location</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900 text-sm">
            {departments.map((dept) => {
              const isSelected = selectedIds.includes(dept.id);
              const managerName = dept.manager
                ? `${dept.manager.firstName} ${dept.manager.lastName}`
                : 'Unassigned';

              return (
                <tr key={dept.id} className="hover:bg-slateDark-900/20 transition-colors">
                  {user.role === 'ADMIN' && (
                    <td className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(dept.id)}
                        className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Name Link */}
                  <td className="p-4">
                    <Link
                      to={`/departments/${dept.id}`}
                      className="font-bold text-white hover:text-brand-400 transition-colors block truncate max-w-[200px]"
                    >
                      {dept.name}
                    </Link>
                  </td>

                  {/* Code */}
                  <td className="p-4 font-mono text-xs text-slateDark-400 select-all uppercase">
                    {dept.code}
                  </td>

                  {/* Manager */}
                  <td className="p-4">
                    {dept.manager ? (
                      <span className="text-slateDark-200 font-semibold">{managerName}</span>
                    ) : (
                      <span className="text-slateDark-500 italic select-none">Unassigned</span>
                    )}
                  </td>

                  {/* Employee Count */}
                  <td className="p-4 text-center font-bold text-slateDark-300">
                    {dept._count?.employees || 0}
                  </td>

                  {/* Status */}
                  <td className="p-4">{getStatusBadge(dept.status)}</td>

                  {/* Location */}
                  <td className="p-4 hidden md:table-cell text-slateDark-400">{dept.location}</td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2.5">
                      <Link
                        to={`/departments/${dept.id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slateDark-800 hover:bg-slateDark-850 hover:text-white transition-colors text-xs font-semibold select-none"
                        title="View Details"
                      >
                        📄 View
                      </Link>

                      {user.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => onEdit(dept)}
                            className="px-2.5 py-1.5 rounded-lg border border-slateDark-800 hover:bg-slateDark-850 hover:text-brand-400 transition-colors text-xs font-semibold select-none"
                            title="Edit Department"
                          >
                            ✏️ Edit
                          </button>

                          {isTrashMode ? (
                            <button
                              onClick={() => handleSingleRestore(dept.id, dept.name)}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-500/10 text-brand-400 hover:bg-brand-500/10 transition-colors text-xs font-semibold select-none"
                              title="Restore Department"
                            >
                              ♻️ Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSingleDelete(dept.id, dept.name)}
                              className="px-2.5 py-1.5 rounded-lg border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold select-none"
                              title="Delete Department"
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
