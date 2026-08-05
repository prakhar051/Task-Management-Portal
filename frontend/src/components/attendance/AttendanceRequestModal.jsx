import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendanceRequestModal({ isOpen, onClose, onSubmit, isLoading, apiError }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  if (!isOpen) return null;

  const onSubmitForm = async (data) => {
    try {
      const success = await onSubmit({
        date: data.date,
        requestedClockIn: data.requestedClockIn ? new Date(`${data.date}T${data.requestedClockIn}:00.000Z`).toISOString() : null,
        requestedClockOut: data.requestedClockOut ? new Date(`${data.date}T${data.requestedClockOut}:00.000Z`).toISOString() : null,
        requestedStatus: data.requestedStatus,
        reason: data.reason
      });
      if (success) {
        reset();
        onClose();
      }
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
            className="absolute top-4 right-4 text-slateDark-500 hover:text-white"
          >
            ✕
          </button>

          <div className="border-b border-slateDark-900 pb-3">
            <h3 className="text-base font-extrabold text-white">Manual Attendance Correction</h3>
            <p className="text-slateDark-500 text-xs mt-0.5">Submit adjustments for correction approval.</p>
          </div>

          {apiError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
              ⚠️ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Target Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Target Date</label>
              <input
                type="date"
                {...register('date', { required: 'Please specify the correction target date.' })}
                className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
              {errors.date && <p className="text-[9.5px] text-red-400 font-bold">{errors.date.message}</p>}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Clock In Time</label>
                <input
                  type="time"
                  {...register('requestedClockIn')}
                  className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Clock Out Time</label>
                <input
                  type="time"
                  {...register('requestedClockOut')}
                  className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Requested Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Correction Status</label>
              <select
                {...register('requestedStatus', { required: 'Status value is required.' })}
                className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none"
              >
                <option value="PRESENT">Present</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="LEAVE">Approved Leave</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Justification Reason</label>
              <textarea
                {...register('reason', { required: 'Please supply a justification reason.' })}
                rows={2}
                placeholder="Reason for manual request (e.g. forgot check-in)..."
                className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none resize-none"
              />
              {errors.reason && <p className="text-[9.5px] text-red-400 font-bold">{errors.reason.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slateDark-905 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
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
