import React from 'react';
import KanbanCard from './KanbanCard';
import { useTaskStore } from '../../store/taskStore';

export default function KanbanColumn({ title, status, tasks, icon, color }) {
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-slateDark-900/50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-slateDark-900/50');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-slateDark-900/50');
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      try {
        await updateTaskStatus(taskId, status);
      } catch (err) {
        alert(err.response?.data?.message || `Failed to transition task status to ${status}.`);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col bg-slateDark-900/20 border border-slateDark-900/80 rounded-2xl w-full min-h-[600px] transition-all overflow-hidden"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-slateDark-900 bg-slateDark-900/10 select-none">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{icon}</span>
          <h3 className="font-bold text-white text-xs.5 uppercase tracking-wider">{title}</h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${color}`}>
          {tasks.length}
        </span>
      </div>

      {/* Cards List container */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto max-h-[580px]">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="h-32 flex items-center justify-center border border-dashed border-slateDark-800/40 rounded-xl select-none">
            <span className="text-slateDark-500 text-xs font-semibold">Drop task here</span>
          </div>
        )}
      </div>
    </div>
  );
}
