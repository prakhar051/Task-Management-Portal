import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';

// Components
import ProjectToolbar from '../components/projects/ProjectToolbar';
import ProjectStatistics from '../components/projects/ProjectStatistics';
import BulkActionToolbar from '../components/projects/BulkActionToolbar';
import ProjectTable from '../components/projects/ProjectTable';
import ProjectPagination from '../components/projects/ProjectPagination';
import ProjectModal from '../components/projects/ProjectModal';
import ProjectForm from '../components/projects/ProjectForm';
import ProjectSkeleton from '../components/projects/ProjectSkeleton';
import ErrorState from '../components/dashboard/ErrorState';

export default function Projects() {
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { fetchProjects, fetchStatistics, loading, error } = useProjectStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProj, setSelectedProj] = useState(null);

  useEffect(() => {
    fetchProjects();
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
      fetchStatistics();
    }
  }, [fetchProjects, fetchStatistics, currentUser.role]);

  const handleOpenCreateModal = () => {
    setSelectedProj(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setSelectedProj(proj);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProj(null);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Search filters & Add button */}
      <ProjectToolbar onAddClick={handleOpenCreateModal} />

      {/* Global metrics grid - ADMIN & MANAGER only */}
      {(currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') && (
        <ProjectStatistics />
      )}

      {/* Bulk actions banner */}
      <BulkActionToolbar />

      {/* Projects roster table grid */}
      {loading ? (
        <ProjectSkeleton />
      ) : error ? (
        <ErrorState errorMsg={error} onRetry={fetchProjects} />
      ) : (
        <div className="space-y-4">
          <ProjectTable onEdit={handleOpenEditModal} />
          <ProjectPagination />
        </div>
      )}

      {/* Modals containers */}
      {modalOpen && (
        <ProjectModal
          title={selectedProj ? 'Edit Project Details' : 'Register New Project Track'}
          onClose={handleCloseModal}
        >
          <ProjectForm project={selectedProj} onClose={handleCloseModal} />
        </ProjectModal>
      )}
    </div>
  );
}
