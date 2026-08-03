import React from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/apiClient';

export default function KanbanCard({ task }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'MEDIUM':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slateDark-400 bg-slateDark-800 border-slateDark-700/60';
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BUG':
        return '🐛 Bug';
      case 'FEATURE':
        return '💡 Feature';
      case 'RESEARCH':
        return '🔬 Research';
      case 'IMPROVEMENT':
        return '🔧 Improvement';
      default:
        return '📄 Doc';
    }
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="p-4 bg-slateDark-950/60 border border-slateDark-900 hover:border-brand-500/40 rounded-xl space-y-3 cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-brand-500/5 transition-all select-none group"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold font-mono text-slateDark-400">
          {task.taskCode}
        </span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      <Link
        to={`/tasks/${task.id}`}
        className="text-white hover:text-brand-400 font-bold text-xs.5 leading-snug line-clamp-2 block transition-colors"
      >
        {task.title}
      </Link>

      <div className="flex items-center justify-between text-[10px] text-slateDark-400 border-t border-slateDark-900/60 pt-3">
        <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wide">
          <span className="px-1.5 py-0.5 bg-slateDark-900 border border-slateDark-800 text-[9px] rounded text-slateDark-300">
            {getTypeBadge(task.type)}
          </span>
          {task.dueDate && (
            <span className="text-slateDark-500 font-mono">
              📅 {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        <div className="flex -space-x-1 overflow-hidden">
          {task.assignees?.slice(0, 2).map((a) => (
            <div
              key={a.id}
              title={`${a.employee?.firstName} ${a.employee?.lastName}`}
              className="w-5.5 h-5.5 rounded-full bg-brand-500/20 text-brand-400 border border-slateDark-950 font-bold flex items-center justify-center text-[8px] uppercase"
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
          {task.assignees?.length > 2 && (
            <div
              title={`${task.assignees.length - 2} more`}
              className="w-5.5 h-5.5 rounded-full bg-slateDark-850 border border-slateDark-950 text-slateDark-400 font-bold flex items-center justify-center text-[7px]"
            >
              +{task.assignees.length - 2}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center space-x-2 pt-1">
        <div className="flex-1 h-1 bg-slateDark-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${task.completionPercentage}%` }}
          />
        </div>
        <span className="text-[9px] font-bold font-mono text-slateDark-400">
          {task.completionPercentage}%
        </span>
      </div>
    </div>
  );
}
