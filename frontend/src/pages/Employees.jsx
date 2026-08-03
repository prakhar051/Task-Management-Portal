import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';

// Import sub-components
import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeePagination from '../components/employees/EmployeePagination';
import EmployeeForm from '../components/employees/EmployeeForm';
import EmployeeSkeleton from '../components/employees/EmployeeSkeleton';
import ErrorState from '../components/dashboard/ErrorState';

export default function Employees() {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { fetchEmployees, loading, error } = useEmployeeStore();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenCreateForm = () => {
    setSelectedEmployee(null);
    setFormOpen(true);
  };

  const handleOpenEditForm = (emp) => {
    setSelectedEmployee(emp);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slateDark-900 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Team Registry</h1>
          <p className="text-slateDark-400 text-sm mt-1">Manage collaborate credentials and roles allocation.</p>
        </div>

        {user.role === 'ADMIN' && (
          <button
            onClick={handleOpenCreateForm}
            className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95 flex items-center gap-2 select-none"
          >
            <span>➕</span>
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {/* Filter and sorting actions bar */}
      <EmployeeFilters />

      {/* Roster Listing */}
      {loading ? (
        <EmployeeSkeleton />
      ) : error ? (
        <ErrorState errorMsg={error} onRetry={fetchEmployees} />
      ) : (
        <div className="space-y-4">
          <EmployeeTable onEdit={handleOpenEditForm} />
          <EmployeePagination />
        </div>
      )}

      {/* Popup Form Modal */}
      {formOpen && (
        <EmployeeForm employee={selectedEmployee} onClose={handleCloseForm} />
      )}
    </div>
  );
}
