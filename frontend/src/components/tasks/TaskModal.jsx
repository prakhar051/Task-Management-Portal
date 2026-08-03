import React from 'react';
import TaskForm from './TaskForm';

export default function TaskModal({ task, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slateDark-900 border border-slateDark-800/80 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slateDark-900 select-none">
          <h2 className="text-lg font-extrabold text-white">
            {task ? `✏️ Edit Task: ${task.taskCode}` : '📝 Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slateDark-400 hover:text-white text-lg transition-colors bg-slateDark-850 hover:bg-slateDark-800 w-8 h-8 flex items-center justify-center rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <TaskForm task={task} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
