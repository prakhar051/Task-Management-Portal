import React, { useEffect, useState } from 'react';
import { useDepartmentStore } from '../../store/departmentStore';

export default function EmployeeAssignmentModal({ department, onClose }) {
  const { assignEmployees, loading: storeLoading } = useDepartmentStore();

  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const { apiClient } = await import('../../api/apiClient');
        const response = await apiClient.get('/employees?limit=1000');
        
        const allEmployees = response.data.data;
        setEmployees(allEmployees);

        // Pre-select employees already in this department
        const activeDepartmentEmployees = allEmployees
          .filter((emp) => emp.departmentId === department.id)
          .map((emp) => emp.id);
        setSelectedIds(activeDepartmentEmployees);
      } catch (err) {
        setError('Failed to retrieve employees directory.');
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, [department.id]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    // If no employees selected, we can't save as Zod requires min 1 or we handle clearing them.
    // Wait, if Zod requires min 1, let's look at Zod schema: `employeeIds: z.array(z.string().uuid()).min(1)`
    // So if the user clears all check boxes, we must alert them to select at least one employee or handle empty state.
    if (selectedIds.length === 0) {
      setError('Please select at least one employee to map to this department.');
      return;
    }

    const result = await assignEmployees(department.id, selectedIds);
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
          <h3 className="font-extrabold text-white text-lg font-sans">Allocate Workforce</h3>
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
              Check employees to allocate to this department:
            </span>

            {loading ? (
              <div className="py-8 text-center text-slateDark-400 text-xs font-semibold">Retrieving workforce...</div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2">
                {employees.map((emp) => {
                  const isChecked = selectedIds.includes(emp.id);
                  const isOtherDept = emp.departmentId && emp.departmentId !== department.id;

                  return (
                    <label
                      key={emp.id}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-slateDark-900/60 border border-slateDark-850 hover:border-slateDark-800 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(emp.id)}
                        className="rounded border-slateDark-800 text-brand-600 focus:ring-brand-500 bg-slateDark-950 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-white block truncate">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <span className="text-xs text-slateDark-400 block truncate">
                          {emp.designation}{' '}
                          {isOtherDept && (
                            <span className="text-brand-400 font-bold ml-1.5">(Transfer from other Dept)</span>
                          )}
                        </span>
                      </div>
                    </label>
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
