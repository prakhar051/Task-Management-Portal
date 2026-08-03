import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApprovalModal({ isOpen, onClose, leave, onApprove, onReject, isLoading, apiError }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen || !leave) return null;

  const handleApprove = async () => {
    try {
      await onApprove(leave.id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      await onReject(leave.id, rejectReason);
      setRejectReason('');
      setShowRejectForm(false);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slateDark-950 border border-slateDark-900 rounded-2xl p-6 space-y-4 shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slateDark-500 hover:text-white transition-colors"
          >
            ✕
          </button>

          <div className="border-b border-slateDark-900 pb-3">
            <h3 className="text-base font-extrabold text-white">Review Leave Request</h3>
            <p className="text-slateDark-500 text-xs mt-0.5">Approve or reject leave application for department staff.</p>
          </div>

          {apiError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
              ⚠️ {apiError}
            </div>
          )}

          <div className="p-4 bg-slateDark-900/30 border border-slateDark-900 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slateDark-400">Applicant</span>
              <span className="font-mono text-white">
                {leave.employee?.firstName} {leave.employee?.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slateDark-400">Leave Type</span>
              <span className="font-mono text-white bg-slateDark-900 px-2 py-0.5 rounded text-[10px] font-bold">
                {leave.type}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slateDark-400">Duration</span>
              <span className="font-mono text-white">
                {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="border-t border-slateDark-900/60 pt-2 text-xs">
              <span className="font-extrabold text-slateDark-400 block mb-1">Reason Description</span>
              <p className="text-slateDark-300 italic text-[11px] leading-relaxed">
                "{leave.reason}"
              </p>
            </div>
          </div>

          {showRejectForm ? (
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">
                Specify Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejecting this request..."
                rows={2}
                className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3.5 py-1.5 border border-slateDark-850 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-[10.5px] font-bold transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isLoading || !rejectReason.trim()}
                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 text-white rounded-xl text-[10.5px] font-bold transition-all disabled:opacity-50"
                >
                  Submit Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 bg-slateDark-905 hover:bg-red-500/10 border border-slateDark-800 hover:border-red-500/20 text-slateDark-400 hover:text-red-400 rounded-xl text-xs font-bold transition-all"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isLoading}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 hover:border-emerald-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Approve Request'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
