import React, { useEffect, useState } from 'react';
import { useDepartmentStore } from '../../store/departmentStore';

export default function ManagerAssignmentModal({ department, onClose }) {
  const { assignManager, loading: storeLoading } = useDepartmentStore();

  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState(department.managerId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const { apiClient } = await import('../../api/apiClient');
        const response = await apiClient.get('/employees?limit=1000');
        setEmployees(response.data.data);
      } catch (err) {
        setError('Failed to load employees list.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    const result = await assignManager(department.id, selectedId || null);
    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 select-none">
      <div className="glass w-full max-w-md rounded-2xl border border-slateDark-800 overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slateDark-900 flex justify-between items-center">
          <h3 className="font-extrabold text-white text-lg">Assign Department Manager</h3>
          <button
            onClick={onClose}
            className="text-slateDark-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slateDark-300 mb-2">
              Select Managing Employee
            </label>
            {loading ? (
              <div className="py-2.5 text-slateDark-400 text-xs font-semibold">Retrieving workforce directory...</div>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="">Leave Unassigned / Clear Manager</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.designation})
                  </option>
                ))}
              </select>
            )}
            <p className="text-[10px] text-slateDark-500 mt-2 leading-relaxed">
              💡 A manager can only manage one department at a time. Re-assigning an active manager will remove them from their previous department automatically.
            </p>
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
              {storeLoading ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
