import React from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfferDialog({ isOpen, onClose, candidate, onSubmit }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      grossSalary: 6000,
      expiresInDays: 14
    }
  });

  if (!isOpen || !candidate) return null;

  const onSubmitForm = async (data) => {
    const success = await onSubmit({
      candidateId: candidate.id,
      jobOpeningId: candidate.jobOpeningId,
      grossSalary: parseFloat(data.grossSalary),
      expiresAt: new Date(Date.now() + parseInt(data.expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
    });
    if (success) {
      reset();
      onClose();
    }
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
            <h3 className="text-base font-extrabold text-white">Generate Job Offer Letter</h3>
            <p className="text-slateDark-500 text-xs mt-0.5">
              Draft compensation package proposed to candidate: {candidate.firstName} {candidate.lastName}.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 text-xs font-semibold text-slateDark-300">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Proposed Gross Salary (Monthly)</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register('grossSalary', { required: true })}
                className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Offer Expiry (Days)</label>
              <input
                type="number"
                {...register('expiresInDays', { required: true })}
                className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slateDark-905 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black transition-all"
              >
                Draft Offer
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
