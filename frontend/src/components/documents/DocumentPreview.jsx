import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../api/apiClient';

export default function DocumentPreview({ doc, isOpen, onClose }) {
  if (!isOpen || !doc) return null;

  const latestVer = doc.versions[0];
  const extension = latestVer?.extension?.toLowerCase();
  
  // Resolve inline preview URL:
  const previewUrl = `${API_URL}/documents/${doc.id}/preview`;

  const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(extension);
  const isPdf = extension === 'pdf';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl h-[80vh] bg-slateDark-950 border border-slateDark-900 rounded-3xl p-6 flex flex-col space-y-4 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slateDark-500 hover:text-white z-10">✕</button>

          <div className="border-b border-slateDark-900 pb-3 flex justify-between items-center pr-8">
            <div>
              <h3 className="text-sm font-extrabold text-white">{doc.name}</h3>
              <p className="text-slateDark-500 text-[10px] font-semibold font-mono">Format: {extension?.toUpperCase()} | Revision: v{latestVer?.versionNumber}</p>
            </div>
          </div>

          <div className="flex-1 bg-slateDark-905 rounded-2xl overflow-hidden flex items-center justify-center border border-slateDark-900/60">
            {isImage ? (
              <img
                src={previewUrl}
                alt={doc.name}
                className="max-w-full max-h-full object-contain"
                crossOrigin="use-credentials"
              />
            ) : isPdf ? (
              <iframe
                src={previewUrl}
                title={doc.name}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="text-center space-y-3.5">
                <span className="text-4xl block">📦</span>
                <p className="text-xs font-semibold text-slateDark-400">
                  Preview is not available directly inline for {extension?.toUpperCase()} files.
                </p>
                <a
                  href={`${previewUrl}?download=true`}
                  download
                  className="inline-block px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl"
                >
                  Download File Instead
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
