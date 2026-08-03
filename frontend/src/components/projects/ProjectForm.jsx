import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useProjectStore } from '../../store/projectStore';

export default function ProjectForm({ project, onClose }) {
  const { createProject, updateProject, loading } = useProjectStore();
  const [departments, setDepartments] = useState([]);
  const [serverError, setServerError] = useState(null);

  // Load departments dropdown options
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { apiClient } = await import('../../api/apiClient');
        const res = await apiClient.get('/departments?limit=1000');
        setDepartments(res.data.data || []);
      } catch (err) {
        console.error('Failed to load departments selection:', err);
      }
    };
    loadDepartments();
  }, []);

  const formatDateForInput = (isoString) => {
    if (!isoString) return '';
    return isoString.split('T')[0];
  };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: project
      ? {
          name: project.name,
          code: project.code,
          description: project.description || '',
          departmentId: project.departmentId,
          startDate: formatDateForInput(project.startDate),
          endDate: formatDateForInput(project.endDate),
          priority: project.priority,
          status: project.status,
          budget: project.budget || 0,
          progress: project.progress || 0
        }
      : {
          name: '',
          code: '',
          description: '',
          departmentId: '',
          startDate: '',
          endDate: '',
          priority: 'MEDIUM',
          status: 'PLANNING',
          budget: 0,
          progress: 0
        }
  });

  const onSubmit = async (data) => {
    setServerError(null);

    // Format dates to ISO strings before dispatching
    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      budget: parseFloat(data.budget || 0),
      progress: parseInt(data.progress || 0)
    };

    let result;
    if (project) {
      result = await updateProject(project.id, payload);
    } else {
      result = await createProject(payload);
    }

    if (result.success) {
      onClose();
    } else {
      setServerError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
      {serverError && (
        <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Project Name</label>
          <input
            type="text"
            {...register('name', { required: 'Project name is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="System Redesign"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Project Code</label>
          <input
            type="text"
            {...register('code', { required: 'Code is required' })}
            disabled={!!project}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500 uppercase font-mono disabled:opacity-50"
            placeholder="PROJ-01"
          />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Department Mapping</label>
          <select
            {...register('departmentId', { required: 'Department mapping is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">Select Department...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Budget ($)</label>
          <input
            type="number"
            step="0.01"
            {...register('budget')}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="50000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Start Date</label>
          <input
            type="date"
            {...register('startDate', { required: 'Start date is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          />
          {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">End Date</label>
          <input
            type="date"
            {...register('endDate', { required: 'End date is required' })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          />
          {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Priority</label>
          <select
            {...register('priority')}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Status</label>
          <select
            {...register('status')}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="PLANNING">PLANNING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ON_HOLD">ON_HOLD</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Progress (%)</label>
          <input
            type="number"
            {...register('progress', {
              min: { value: 0, message: 'Minimum progress is 0%' },
              max: { value: 100, message: 'Maximum progress is 100%' }
            })}
            className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
            placeholder="0"
          />
          {errors.progress && <p className="text-red-500 text-xs mt-1">{errors.progress.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slateDark-300 mb-1.5">Description</label>
        <textarea
          rows="3"
          {...register('description')}
          className="w-full px-3 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white text-sm focus:outline-none focus:border-brand-500"
          placeholder="Optional notes or details about this project..."
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
          {loading ? 'Processing...' : project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
