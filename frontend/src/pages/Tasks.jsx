import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import TaskToolbar from '../components/tasks/TaskToolbar';
import TaskSearch from '../components/tasks/TaskSearch';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskTable from '../components/tasks/TaskTable';
import TaskKanban from '../components/tasks/TaskKanban';
import TaskPagination from '../components/tasks/TaskPagination';
import TaskSkeleton from '../components/tasks/TaskSkeleton';
import TaskModal from '../components/tasks/TaskModal';
import BulkActionToolbar from '../components/tasks/BulkActionToolbar';

export default function Tasks() {
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const isLoading = useTaskStore((state) => state.isLoading);
  const viewMode = useTaskStore((state) => state.viewMode);
  const error = useTaskStore((state) => state.error);
  const clearSelection = useTaskStore((state) => state.clearSelection);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
    return () => {
      // Clear bulk selections on unmount
      clearSelection();
    };
  }, [fetchTasks, clearSelection]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tasks</h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Manage projects tasks, status workflows, and collaborate with assignees.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* Toolbar Controls */}
      <TaskToolbar onAddTask={() => setIsModalOpen(true)} />

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-start">
        <TaskSearch />
      </div>
      <TaskFilters />

      {/* Task Content Layout */}
      {isLoading ? (
        <TaskSkeleton view={viewMode} />
      ) : viewMode === 'kanban' ? (
        <TaskKanban />
      ) : (
        <div className="space-y-4">
          <TaskTable />
          <TaskPagination />
        </div>
      )}

      {/* Bulk Operations Toolbar */}
      <BulkActionToolbar />

      {/* Task Modal Create */}
      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
