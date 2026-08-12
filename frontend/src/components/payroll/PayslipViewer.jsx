import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../../api/apiClient';

export default function PayslipViewer({ isOpen, onClose, itemId, payslipNumber }) {
  if (!isOpen || !itemId) return null;

  // Resolve payslip download/view path:
  const pdfUrl = `${API_URL}/payroll/payslip/${itemId}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl h-[85vh] bg-slateDark-950 border border-slateDark-900 rounded-3xl p-6 flex flex-col space-y-4 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slateDark-500 hover:text-white z-10">✕</button>

          <div className="border-b border-slateDark-900 pb-2">
            <h3 className="text-sm font-extrabold text-white">Payslip Statement Viewer</h3>
            <p className="text-slateDark-500 text-[10px] font-semibold font-mono">Reference ID: {payslipNumber}</p>
          </div>

          <div className="flex-1 bg-slateDark-905 rounded-2xl overflow-hidden border border-slateDark-900/60">
            <iframe
              src={pdfUrl}
              title={`Payslip ${payslipNumber}`}
              className="w-full h-full border-0"
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
