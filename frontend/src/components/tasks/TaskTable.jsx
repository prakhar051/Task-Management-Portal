import React from 'react';
import { Link } from 'react-router-dom';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/apiClient';

export default function TaskTable() {
  const tasks = useTaskStore((state) => state.tasks);
  const selectedIds = useTaskStore((state) => state.selectedIds);
  const toggleSelect = useTaskStore((state) => state.toggleSelect);
  const toggleSelectAll = useTaskStore((state) => state.toggleSelectAll);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === 'ADMIN';

  const taskIds = tasks.map((t) => t.id);
  const allSelected = taskIds.length > 0 && taskIds.every((id) => selectedIds.includes(id));

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to soft delete this task?')) {
      await deleteTask(id);
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/10 text-red-400 border border-red-500/25';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 'MEDIUM':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      default:
        return 'bg-slateDark-800 text-slateDark-300 border border-slateDark-700/60';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 'IN_PROGRESS':
        return 'bg-brand-500/10 text-brand-400 border border-brand-500/25';
      case 'IN_REVIEW':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25';
      case 'BLOCKED':
        return 'bg-red-500/10 text-red-400 border border-red-500/25';
      case 'CANCELLED':
        return 'bg-slateDark-800 text-slateDark-400 border border-slateDark-700/60';
      default:
        return 'bg-slateDark-900 text-slateDark-300 border border-slateDark-800';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-16 text-center animate-fade-in">
        <span className="text-4xl block mb-4 select-none">📋</span>
        <h3 className="font-bold text-white text-lg mb-1">No tasks matched</h3>
        <p className="text-slateDark-400 text-sm max-w-sm mx-auto">
          Adjust your filters, clear your search parameters, or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slateDark-900 bg-slateDark-900/40 text-[10px] font-extrabold text-slateDark-400 uppercase tracking-wider select-none">
              <th className="px-6 py-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => toggleSelectAll(taskIds)}
                  className="w-4 h-4 accent-brand-500 rounded border-slateDark-800 cursor-pointer bg-slateDark-900 focus:outline-none"
                />
              </th>
              <th className="px-6 py-4">Task Code</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Assignees</th>
              {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900 text-sm font-semibold text-slateDark-300">
            {tasks.map((task) => (
              <tr
                key={task.id}
                className={`hover:bg-slateDark-900/30 transition-colors ${
                  selectedIds.includes(task.id) ? 'bg-brand-500/5' : ''
                }`}
              >
                <td className="px-6 py-4.5 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(task.id)}
                    onChange={() => toggleSelect(task.id)}
                    className="w-4 h-4 accent-brand-500 rounded border-slateDark-800 cursor-pointer bg-slateDark-900 focus:outline-none"
                  />
                </td>
                <td className="px-6 py-4.5 font-mono text-xs font-bold text-slateDark-400 select-all">
                  {task.taskCode}
                </td>
                <td className="px-6 py-4.5">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="text-white hover:text-brand-400 font-bold transition-colors block max-w-[240px] truncate"
                  >
                    {task.title}
                  </Link>
                  <div className="flex items-center space-x-1.5 mt-1 select-none">
                    <span className="text-[10px] px-2 py-0.5 bg-slateDark-900 border border-slateDark-800 text-slateDark-400 rounded-md font-bold uppercase tracking-wider">
                      {task.type}
                    </span>
                    {task.parentTask && (
                      <span className="text-[10px] text-slateDark-500">
                        ↳ subtask of {task.parentTask.taskCode}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4.5 text-slateDark-400 text-xs">
                  {task.project?.name}
                </td>
                <td className="px-6 py-4.5 select-none">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${getPriorityBadgeColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4.5 select-none">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${getStatusBadgeColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-1.5 bg-slateDark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${task.completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold font-mono text-white">
                      {task.completionPercentage}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4.5 text-xs text-slateDark-400 font-mono">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                </td>
                <td className="px-6 py-4.5">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {task.assignees?.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        title={`${a.employee?.firstName} ${a.employee?.lastName}`}
                        className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 border border-slateDark-950 font-bold flex items-center justify-center text-[10px] uppercase select-none"
                      >
                        {a.employee?.avatar ? (
                          <img
                            src={`${apiClient.defaults.baseURL || ''}${a.employee.avatar}`}
                            alt="avatar"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          a.employee?.firstName?.charAt(0)
                        )}
                      </div>
                    ))}
                    {task.assignees?.length > 3 && (
                      <div
                        title={`${task.assignees.length - 3} more`}
                        className="w-7 h-7 rounded-full bg-slateDark-800 border border-slateDark-950 text-slateDark-400 font-bold flex items-center justify-center text-[9px] uppercase select-none"
                      >
                        +{task.assignees.length - 3}
                      </div>
                    )}
                    {task.assignees?.length === 0 && (
                      <span className="text-xs text-slateDark-500 select-none">Unassigned</span>
                    )}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4.5 text-center select-none">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg text-xs font-bold transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
