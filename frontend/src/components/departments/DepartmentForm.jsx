import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDepartmentStore } from '../../store/departmentStore';

export default function DepartmentForm({ department, onClose }) {
  const { createDepartment, updateDepartment, loading } = useDepartmentStore();
  const [serverError, setServerError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: department
      ? {
          name: department.name,
          code: department.code,
          description: department.description || '',
          location: department.location,
          email: department.email,
          phone: department.phone,
          status: department.status
        }
      : {
          name: '',
          code: '',
          description: '',
          location: '',
          email: '',
          phone: '',
          status: 'ACTIVE'
        }
  });

  const onSubmit = async (data) => {
    setServerError(null);
    let result;

    if (department) {
      result = await updateDepartment(department.id, data);
    } else {
      result = await createDepartment(data);
    }

    if (result.success) {
      onClose();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm select-none">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5 select-none">Department Name</label>
          <input
            type="text"
            {...register('name', { required: 'Department name is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="Engineering"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5 select-none">Department Code</label>
          <input
            type="text"
            {...register('code', { required: 'Code is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500 uppercase font-mono"
            placeholder="ENG"
          />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5 select-none">Email Address</label>
          <input
            type="email"
            {...register('email', { required: 'Email address is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="eng@company.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5 select-none">Phone Number</label>
          <input
            type="text"
            {...register('phone', { required: 'Phone is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="555-019-2834"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5 select-none">Office Location</label>
          <input
            type="text"
            {...register('location', { required: 'Location is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="Floor 4, Block C"
          />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5 select-none">Active Status</label>
          <select
            {...register('status')}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slateDark-300 mb-1.5 select-none">Description</label>
        <textarea
          rows="3"
          {...register('description')}
          className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          placeholder="Optional notes or context about this department..."
        />
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slateDark-900">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-lg border border-slateDark-800 text-slateDark-300 text-sm font-semibold hover:bg-slateDark-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : department ? 'Update Department' : 'Create Department'}
        </button>
      </div>
    </form>
  );
}
