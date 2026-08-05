import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentDialog({ isOpen, onClose, onConfirm, payroll }) {
  const [method, setMethod] = useState('BANK_TRANSFER');

  if (!isOpen || !payroll) return null;

  const handleConfirm = () => {
    onConfirm(payroll.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slateDark-950 border border-slateDark-900 rounded-3xl p-6 space-y-4 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slateDark-500 hover:text-white">✕</button>

          <div className="border-b border-slateDark-900 pb-3">
            <h3 className="text-base font-extrabold text-white">Disburse Salary Payments</h3>
            <p className="text-slateDark-500 text-xs mt-0.5">Approve and disburse salaries for Month {payroll.month}, {payroll.year}.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Disbursement Channel</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="BANK_TRANSFER">Direct Bank Transfer (ACH/Swift)</option>
                <option value="UPI">Instant UPI</option>
                <option value="CHEQUE">Company Cheque</option>
                <option value="CASH">Cash Pay</option>
              </select>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl">
              <p className="text-[10.5px] text-amber-400 font-semibold leading-normal">
                ⚠️ Confirming this action marks all payroll statements as paid and logs audit trails. Ensure funds are ready for release.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slateDark-905 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all"
              >
                Disburse Funds
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
