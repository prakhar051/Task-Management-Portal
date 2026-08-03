import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';

export default function TaskToolbar({ onAddTask }) {
  const viewMode = useTaskStore((state) => state.viewMode);
  const setViewMode = useTaskStore((state) => state.setViewMode);
  const exportTasks = useTaskStore((state) => state.exportTasksCSV);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 select-none">
      {/* Switch Tab buttons for View */}
      <div className="flex bg-slateDark-900 border border-slateDark-800 p-1 rounded-xl">
        <button
          onClick={() => setViewMode('kanban')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'kanban'
              ? 'bg-slateDark-850 text-white border border-slateDark-800 shadow-md'
              : 'text-slateDark-400 hover:text-white'
          }`}
        >
          <span>📋</span>
          <span>Kanban Board</span>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'list'
              ? 'bg-slateDark-850 text-white border border-slateDark-800 shadow-md'
              : 'text-slateDark-400 hover:text-white'
          }`}
        >
          <span>📂</span>
          <span>List Directory</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={fetchTasks}
          title="Refresh tasks"
          className="p-2.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-sm transition-all"
        >
          🔄
        </button>

        <button
          onClick={exportTasks}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
        >
          <span>📥</span>
          <span>Export CSV</span>
        </button>

        {isAdmin && (
          <button
            onClick={onAddTask}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 border border-brand-500 hover:border-brand-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:shadow-brand-500/25"
          >
            <span>➕</span>
            <span>Create Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
