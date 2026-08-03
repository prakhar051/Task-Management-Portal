import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExportDialog({ isOpen, onClose, onExport, isLoading }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm bg-slateDark-950 border border-slateDark-900 rounded-2xl p-6 space-y-4 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slateDark-500 hover:text-white transition-colors"
          >
            ✕
          </button>
          
          <div className="text-center space-y-1">
            <span className="text-3xl">📥</span>
            <h3 className="text-base font-extrabold text-white">Export Report Data</h3>
            <p className="text-slateDark-400 text-xs">Choose the file format to download the generated report document.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { format: 'csv', label: 'CSV', icon: '📄', color: 'hover:border-blue-500/40 hover:bg-blue-500/5' },
              { format: 'xlsx', label: 'Excel', icon: '📊', color: 'hover:border-emerald-500/40 hover:bg-emerald-500/5' },
              { format: 'pdf', label: 'PDF', icon: '📕', color: 'hover:border-red-500/40 hover:bg-red-500/5' }
            ].map((f) => (
              <button
                key={f.format}
                disabled={isLoading}
                onClick={() => onExport(f.format)}
                className={`p-4 border border-slateDark-800 bg-slateDark-900/50 hover:bg-slateDark-900 rounded-xl flex flex-col items-center space-y-2 transition-all group ${f.color} disabled:opacity-45`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{f.icon}</span>
                <span className="text-xs font-bold text-white">{f.label}</span>
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="text-center text-xs text-brand-400 font-bold animate-pulse">
              Generating file, please wait...
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
