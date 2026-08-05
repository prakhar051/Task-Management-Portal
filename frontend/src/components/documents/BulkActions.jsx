import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BulkActions({ selectedCount, onBulkDownload, onClear }) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slateDark-950 border border-slateDark-900 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center space-x-6 select-none"
      >
        <span className="text-xs font-bold text-white">
          🗳️ {selectedCount} file{selectedCount > 1 ? 's' : ''} selected
        </span>

        <div className="flex items-center space-x-3">
          <button
            onClick={onBulkDownload}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-brand-500/10"
          >
            📥 Download ZIP Archive
          </button>
          <button
            onClick={onClear}
            className="px-3 py-2 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            Clear Selection
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
