import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeaveRequestModal({ isOpen, onClose, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  if (!isOpen) return null;

  const onSubmitForm = async (data) => {
    try {
      const success = await onSubmit(data);
      if (success) {
        reset();
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const leaveTypes = [
    { value: 'CASUAL', label: 'Casual Leave' },
    { value: 'SICK', label: 'Sick Leave' },
    { value: 'PAID', label: 'Paid Vacation' },
    { value: 'UNPAID', label: 'Unpaid Leave' },
    { value: 'MATERNITY', label: 'Maternity Leave' },
    { value: 'PATERNITY', label: 'Paternity Leave' }
  ];

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
            <h3 className="text-base font-extrabold text-white">Apply for Leave Request</h3>
            <p className="text-slateDark-500 text-xs mt-0.5">Submit your leave dates and details for reviewer approval.</p>
          </div>

          {apiError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl leading-normal">
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Leave Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider">Leave Type</label>
              <select
                {...register('type', { required: 'Leave type selection is required.' })}
                className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
              >
                {leaveTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range picker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  {...register('startDate', { required: 'Start date is required.' })}
                  className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
                {errors.startDate && <p className="text-[9.5px] text-red-400 font-bold">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  {...register('endDate', { required: 'End date is required.' })}
                  className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
                {errors.endDate && <p className="text-[9.5px] text-red-400 font-bold">{errors.endDate.message}</p>}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider">Reason Details</label>
              <textarea
                {...register('reason', { required: 'Please specify the reason for leave.' })}
                rows={3}
                placeholder="Details of your leave request..."
                className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none resize-none"
              />
              {errors.reason && <p className="text-[9.5px] text-red-400 font-bold">{errors.reason.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
