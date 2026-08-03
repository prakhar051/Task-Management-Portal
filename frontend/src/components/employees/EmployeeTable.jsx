import React from 'react';
import { Link } from 'react-router-dom';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';

export default function EmployeeTable({ onEdit }) {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { employees, selectedIds, toggleSelect, toggleSelectAll, deleteEmployee, restoreEmployee, filters } = useEmployeeStore();

  const handleSingleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to soft delete employee: ${name}?`)) {
      const result = await deleteEmployee(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const handleSingleRestore = async (id, name) => {
    if (window.confirm(`Are you sure you want to restore employee: ${name}?`)) {
      const result = await restoreEmployee(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      INACTIVE: 'text-red-400 bg-red-500/10 border-red-500/20',
      ON_LEAVE: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase select-none ${classes[status] || classes.ACTIVE}`}>
        {status}
      </span>
    );
  };

  const getAvatarPath = (path) => {
    if (!path) return null;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  const isTrashMode = filters.isDeleted === 'true';

  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slateDark-800 rounded-2xl glass select-none">
        <div className="text-4xl mb-4">👥</div>
        <h4 className="text-white font-bold text-sm">No Employees Registered</h4>
        <p className="text-slateDark-400 text-xs mt-1 max-w-xs">
          {isTrashMode ? 'The archive directory is clean.' : 'Add new team members to populate the list.'}
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
              {/* Select All Checkbox - ADMIN only */}
              {user.role === 'ADMIN' && (
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={employees.every((e) => selectedIds.includes(e.id))}
                    onChange={toggleSelectAll}
                    className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-4">Employee</th>
              <th className="p-4 hidden md:table-cell">Code</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Status</th>
              <th className="p-4 hidden lg:table-cell">Phone</th>
              <th className="p-4 hidden lg:table-cell">Hire Date</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900 text-sm">
            {employees.map((emp) => {
              const fullName = `${emp.firstName} ${emp.lastName}`;
              const isSelected = selectedIds.includes(emp.id);

              return (
                <tr key={emp.id} className="hover:bg-slateDark-900/20 transition-colors">
                  {/* Row Checkbox - ADMIN only */}
                  {user.role === 'ADMIN' && (
                    <td className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(emp.id)}
                        className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}

                  {/* Avatar and Name */}
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {emp.avatar ? (
                        <img
                          src={getAvatarPath(emp.avatar)}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slateDark-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 font-extrabold flex items-center justify-center text-sm uppercase select-none">
                          {emp.firstName.charAt(0)}
                          {emp.lastName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link to={`/employees/${emp.id}`} className="font-bold text-white hover:text-brand-400 transition-colors block truncate">
                          {fullName}
                        </Link>
                        <span className="text-xs text-slateDark-500 block truncate">{emp.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Employee Code */}
                  <td className="p-4 hidden md:table-cell font-mono text-xs text-slateDark-400">
                    {emp.employeeCode}
                  </td>

                  {/* Designation */}
                  <td className="p-4 text-slateDark-300 font-semibold">{emp.designation}</td>

                  {/* Status Badge */}
                  <td className="p-4">{getStatusBadge(emp.status)}</td>

                  {/* Phone */}
                  <td className="p-4 hidden lg:table-cell text-slateDark-400">{emp.phone}</td>

                  {/* Hire Date */}
                  <td className="p-4 hidden lg:table-cell text-slateDark-400 font-mono text-xs">
                    {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : ''}
                  </td>

                  {/* Actions Column */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2.5">
                      <Link
                        to={`/employees/${emp.id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slateDark-800 hover:bg-slateDark-850 hover:text-white transition-colors text-xs font-semibold select-none"
                        title="View Profile"
                      >
                        📄 View
                      </Link>

                      {user.role === 'ADMIN' && (
                        <>
                          <button
                            onClick={() => onEdit(emp)}
                            className="px-2.5 py-1.5 rounded-lg border border-slateDark-800 hover:bg-slateDark-850 hover:text-brand-400 transition-colors text-xs font-semibold select-none"
                            title="Edit Profile"
                          >
                            ✏️ Edit
                          </button>

                          {isTrashMode ? (
                            <button
                              onClick={() => handleSingleRestore(emp.id, fullName)}
                              className="px-2.5 py-1.5 rounded-lg border border-brand-500/10 text-brand-400 hover:bg-brand-500/10 transition-colors text-xs font-semibold select-none"
                              title="Restore Employee"
                            >
                              ♻️ Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSingleDelete(emp.id, fullName)}
                              className="px-2.5 py-1.5 rounded-lg border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold select-none"
                              title="Delete Profile"
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
