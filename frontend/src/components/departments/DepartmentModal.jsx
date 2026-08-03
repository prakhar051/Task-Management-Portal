import React from 'react';

export default function DepartmentModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 select-none">
      <div className="glass w-full max-w-lg rounded-2xl border border-slateDark-800 overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slateDark-900 flex justify-between items-center">
          <h3 className="font-extrabold text-white text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-slateDark-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
