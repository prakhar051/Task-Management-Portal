import React, { useEffect, useState } from 'react';
import { useDepartmentStore } from '../store/departmentStore';
import { useAuthStore } from '../store/authStore';

// Sub-components
import DepartmentToolbar from '../components/departments/DepartmentToolbar';
import DepartmentStatistics from '../components/departments/DepartmentStatistics';
import BulkActionToolbar from '../components/departments/BulkActionToolbar';
import DepartmentTable from '../components/departments/DepartmentTable';
import DepartmentPagination from '../components/departments/DepartmentPagination';
import DepartmentModal from '../components/departments/DepartmentModal';
import DepartmentForm from '../components/departments/DepartmentForm';
import DepartmentSkeleton from '../components/departments/DepartmentSkeleton';
import ErrorState from '../components/dashboard/ErrorState';

export default function Departments() {
  const user = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { fetchDepartments, fetchStatistics, loading, error } = useDepartmentStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
    // Only administrators or managers have clearance to read statistics aggregates
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      fetchStatistics();
    }
  }, [fetchDepartments, fetchStatistics, user.role]);

  const handleOpenCreateModal = () => {
    setSelectedDept(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setSelectedDept(dept);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDept(null);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Title control header bar and filters */}
      <DepartmentToolbar onAddClick={handleOpenCreateModal} />

      {/* Roster stats counts row - ADMIN & MANAGER only */}
      {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
        <DepartmentStatistics />
      )}

      {/* Bulk actions banner details */}
      <BulkActionToolbar />

      {/* Department listings grids */}
      {loading ? (
        <DepartmentSkeleton />
      ) : error ? (
        <ErrorState errorMsg={error} onRetry={fetchDepartments} />
      ) : (
        <div className="space-y-4">
          <DepartmentTable onEdit={handleOpenEditModal} />
          <DepartmentPagination />
        </div>
      )}

      {/* Modals Popup Dialog */}
      {modalOpen && (
        <DepartmentModal
          title={selectedDept ? 'Edit Department Details' : 'Create New Department'}
          onClose={handleCloseModal}
        >
          <DepartmentForm department={selectedDept} onClose={handleCloseModal} />
        </DepartmentModal>
      )}
    </div>
  );
}
