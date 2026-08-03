import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';

const MemberRoles = [
  'PROJECT_MANAGER',
  'TEAM_LEAD',
  'DEVELOPER',
  'TESTER',
  'DESIGNER',
  'BUSINESS_ANALYST',
  'MEMBER'
];

export default function MemberAssignmentModal({ project, onClose }) {
  const { assignMembers, loading: storeLoading } = useProjectStore();

  const [employees, setEmployees] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]); // [{ employeeId, role }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const { apiClient } = await import('../../api/apiClient');
        const response = await apiClient.get('/employees?limit=1000');
        setEmployees(response.data.data || []);

        // Load existing members from project.members
        if (project.members) {
          const preSelected = project.members.map((m) => ({
            employeeId: m.employeeId,
            role: m.role
          }));
          setSelectedMembers(preSelected);
        }
      } catch (err) {
        setError('Failed to load employees list.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, [project.members]);

  const handleCheckboxChange = (employeeId) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((x) => x.employeeId === employeeId);
      if (exists) {
        return prev.filter((x) => x.employeeId !== employeeId);
      } else {
        return [...prev, { employeeId, role: 'MEMBER' }];
      }
    });
  };

  const handleRoleChange = (employeeId, role) => {
    setSelectedMembers((prev) =>
      prev.map((x) => (x.employeeId === employeeId ? { ...x, role } : x))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    // Zod schema requires min 1 member
    if (selectedMembers.length === 0) {
      setError('Please select at least one member to assign to this project.');
      return;
    }

    const result = await assignMembers(project.id, selectedMembers);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 select-none">
      <div className="glass w-full max-w-lg rounded-2xl border border-slateDark-800 overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slateDark-900 flex justify-between items-center">
          <h3 className="font-extrabold text-white text-lg">Allocate Project Members</h3>
          <button
            onClick={onClose}
            className="text-slateDark-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <span className="block text-xs font-semibold text-slateDark-400 mb-3">
              Check employees and choose their project role:
            </span>

            {loading ? (
              <div className="py-8 text-center text-slateDark-400 text-xs font-semibold">Retrieving workforce...</div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-2">
                {employees.map((emp) => {
                  const assigned = selectedMembers.find((x) => x.employeeId === emp.id);
                  const isChecked = !!assigned;
                  const currentRole = assigned ? assigned.role : 'MEMBER';

                  return (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slateDark-900/60 border border-slateDark-850 hover:border-slateDark-800 transition-all gap-4"
                    >
                      <label className="flex items-center space-x-3 cursor-pointer min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(emp.id)}
                          className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-bold text-white block truncate">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-xs text-slateDark-400 block truncate">
                            {emp.designation}
                          </span>
                        </div>
                      </label>

                      {isChecked && (
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                          className="px-2 py-1 rounded bg-slateDark-950 border border-slateDark-800 text-white text-xs font-semibold focus:outline-none"
                        >
                          {MemberRoles.map((role) => (
                            <option key={role} value={role}>
                              {role.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slateDark-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slateDark-800 text-slateDark-300 text-xs font-bold hover:bg-slateDark-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || storeLoading}
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {storeLoading ? 'Saving...' : 'Apply Mappings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
