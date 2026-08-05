import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function SalaryComponentModal({ isOpen, onClose, structure, onSubmit }) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      baseSalary: 0,
      currency: 'USD',
      components: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'components'
  });

  useEffect(() => {
    if (structure) {
      reset({
        baseSalary: structure.baseSalary,
        currency: structure.currency,
        components: structure.components || []
      });
    } else {
      reset({
        baseSalary: 0,
        currency: 'USD',
        components: []
      });
    }
  }, [structure, reset]);

  if (!isOpen) return null;

  const onSubmitForm = async (data) => {
    const payload = {
      baseSalary: parseFloat(data.baseSalary),
      currency: data.currency,
      effectiveFrom: structure ? structure.effectiveFrom : new Date().toISOString(),
      components: data.components.map((c) => ({
        name: c.name,
        type: c.type,
        amount: parseFloat(c.amount),
        isPercentage: c.isPercentage === 'true' || c.isPercentage === true
      }))
    };

    const employeeId = structure?.employeeId || data.employeeId;
    const success = await onSubmit(employeeId, payload);
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
          className="w-full max-w-2xl bg-slateDark-950 border border-slateDark-900 rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slateDark-500 hover:text-white">✕</button>

          <div className="border-b border-slateDark-900 pb-3">
            <h3 className="text-base font-extrabold text-white">
              {structure ? 'Configure Salary Structure' : 'Create Salary Structure'}
            </h3>
            <p className="text-slateDark-500 text-xs mt-0.5">Assign base salaries, select currencies, and attach items.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
            {/* Employee ID if new */}
            {!structure && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Employee ID</label>
                <input
                  type="text"
                  placeholder="Paste Employee Target UUID"
                  {...register('employeeId', { required: 'Employee reference is required.' })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
              </div>
            )}

            {/* Base pay and currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Base Salary</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  {...register('baseSalary', { required: 'Base Salary is required.' })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Currency</label>
                <input
                  type="text"
                  {...register('currency')}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Salary Components list header */}
            <div className="border-t border-slateDark-900/60 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Salary Components</h4>
                <button
                  type="button"
                  onClick={() => append({ name: '', type: 'ALLOWANCE', amount: 0, isPercentage: false })}
                  className="px-3 py-1 bg-slateDark-900 border border-slateDark-800 text-brand-400 rounded-xl text-[10px] font-bold"
                >
                  ➕ Add Component
                </button>
              </div>

              {/* Components input list */}
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-center bg-slateDark-905/30 border border-slateDark-900 p-3 rounded-2xl">
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <input
                        type="text"
                        placeholder="Name (e.g. Health)"
                        {...register(`components.${index}.name`)}
                        className="px-3 py-2 bg-slateDark-900 border border-slateDark-850 rounded-xl text-white text-xs focus:outline-none"
                      />

                      <select
                        {...register(`components.${index}.type`)}
                        className="px-3 py-2 bg-slateDark-900 border border-slateDark-850 rounded-xl text-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="ALLOWANCE">Allowance</option>
                        <option value="BONUS">Bonus</option>
                        <option value="DEDUCTION">Deduction</option>
                      </select>

                      <input
                        type="number"
                        step="any"
                        placeholder="Amount"
                        {...register(`components.${index}.amount`)}
                        className="px-3 py-2 bg-slateDark-900 border border-slateDark-850 rounded-xl text-white text-xs font-mono focus:outline-none"
                      />

                      <select
                        {...register(`components.${index}.isPercentage`)}
                        className="px-3 py-2 bg-slateDark-900 border border-slateDark-850 rounded-xl text-white text-xs font-semibold focus:outline-none"
                      >
                        <option value="false">Flat Value ($)</option>
                        <option value="true">Percentage (%)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
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
                Save Configuration
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
