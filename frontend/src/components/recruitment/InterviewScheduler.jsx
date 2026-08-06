import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmployeeStore } from '../../store/employeeStore';

export default function InterviewScheduler({ isOpen, onClose, candidateId, onSubmit }) {
  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      type: 'TECHNICAL',
      scheduledAt: '',
      durationMinutes: 60,
      panelEmployeeIds: []
    }
  });

  const employees = useEmployeeStore((state) => state.employees);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  if (!isOpen) return null;

  const onSubmitForm = async (data) => {
    // Format payload
    const payload = {
      candidateId,
      title: data.title,
      type: data.type,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      durationMinutes: parseInt(data.durationMinutes),
      panelEmployeeIds: Array.from(data.panelEmployeeIds || []).map((id) => id)
    };

    const success = await onSubmit(payload);
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
            <h3 className="text-base font-extrabold text-white">Schedule Interview Round</h3>
            <p className="text-slateDark-500 text-xs mt-0.5">Assign rounds and panel interviewers, auto-detect conflicts.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Interview Title</label>
              <input
                type="text"
                placeholder="e.g. System Design Interview"
                {...register('title', { required: true })}
                className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Round Type</label>
                <select
                  {...register('type')}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="TECHNICAL">Technical Round</option>
                  <option value="HR">HR Culture Round</option>
                  <option value="MANAGER">Hiring Manager Round</option>
                  <option value="FINAL">Final Director Round</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Duration (min)</label>
                <input
                  type="number"
                  {...register('durationMinutes')}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Scheduled At</label>
              <input
                type="datetime-local"
                {...register('scheduledAt', { required: true })}
                className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Interview Panel members</label>
              <select
                multiple
                {...register('panelEmployeeIds', { required: true })}
                className="w-full h-32 px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none cursor-pointer"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.designation})
                  </option>
                ))}
              </select>
              <span className="text-[9px] text-slateDark-500 font-semibold block mt-1">Hold Command / Ctrl to select multiple panel members.</span>
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
                Schedule & Sync
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
