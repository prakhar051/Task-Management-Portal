import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useEmployeeStore } from '../../store/employeeStore';

export default function EmployeeForm({ employee, onClose }) {
  const { createEmployee, updateEmployee, loading } = useEmployeeStore();
  const [serverError, setServerError] = useState(null);

  // Format hireDate for date input (YYYY-MM-DD)
  const getFormattedDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          hireDate: getFormattedDate(employee.hireDate),
          status: employee.status,
          employeeCode: employee.employeeCode
        }
      : {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          designation: '',
          hireDate: new Date().toISOString().split('T')[0],
          status: 'ACTIVE',
          employeeCode: ''
        }
  });

  const onSubmit = async (data) => {
    setServerError(null);
    let result;

    if (employee) {
      result = await updateEmployee(employee.id, data);
    } else {
      result = await createEmployee(data);
    }

    if (result.success) {
      onClose();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glass w-full max-w-lg rounded-2xl border border-slateDark-800 overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slateDark-900 flex justify-between items-center">
          <h3 className="font-extrabold text-white text-lg select-none">
            {employee ? 'Edit Employee Profile' : 'Register New Employee'}
          </h3>
          <button
            onClick={onClose}
            className="text-slateDark-500 hover:text-white transition-colors text-xl select-none"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {serverError && (
            <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">First Name</label>
              <input
                type="text"
                {...register('firstName', { required: 'First name is required' })}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Last Name</label>
              <input
                type="text"
                {...register('lastName', { required: 'Last name is required' })}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email address is required' })}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                {...register('phone', { required: 'Phone number is required' })}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Designation Title</label>
              <input
                type="text"
                {...register('designation', { required: 'Designation is required' })}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
                placeholder="Senior Engineer"
              />
              {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Employee Code (Optional)</label>
              <input
                type="text"
                {...register('employeeCode')}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Date of Hire</label>
              <input
                type="date"
                {...register('hireDate', { required: 'Hire date is required' })}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
              {errors.hireDate && <p className="text-red-500 text-xs mt-1">{errors.hireDate.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Active Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
              </select>
            </div>
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
              {loading ? 'Processing...' : employee ? 'Update Profile' : 'Register Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
