import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useJobStore } from '../store/jobStore';
import { useDepartmentStore } from '../store/departmentStore';
import { useEmployeeStore } from '../store/employeeStore';
import JobTable from '../components/recruitment/JobTable';

export default function Jobs() {
  const jobs = useJobStore((state) => state.jobs);
  const fetchJobs = useJobStore((state) => state.fetchJobs);
  const createJob = useJobStore((state) => state.createJob);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);

  const departments = useDepartmentStore((state) => state.departments);
  const fetchDepartments = useDepartmentStore((state) => state.fetchDepartments);

  const employees = useEmployeeStore((state) => state.employees);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
    fetchEmployees();
  }, [fetchJobs, fetchDepartments, fetchEmployees]);

  const openCreateModal = () => {
    setEditingJob(null);
    reset({
      title: '',
      description: '',
      requirements: '',
      departmentId: departments[0]?.id || '',
      hiringManagerId: employees[0]?.id || '',
      status: 'DRAFT'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    reset({
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      departmentId: job.departmentId,
      hiringManagerId: job.hiringManagerId,
      status: job.status
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    let success = false;
    if (editingJob) {
      success = await updateJob(editingJob.id, data);
    } else {
      success = await createJob(data);
    }

    if (success) {
      setIsModalOpen(false);
      reset();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job opening? All candidate profiles bound to it will be lost.')) {
      await deleteJob(id);
    }
  };

  return (
    <div className="space-y-6 select-none pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white">Job Openings</h1>
          <p className="text-slateDark-400 text-xs mt-0.5">Publish job positions and assign manager oversight.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-black transition-all shadow-md"
        >
          ➕ Publish Position
        </button>
      </div>

      <JobTable
        jobs={jobs}
        onEditClick={openEditModal}
        onDeleteClick={handleDelete}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slateDark-955 border border-slateDark-900 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slateDark-500 hover:text-white">✕</button>

            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slateDark-900 pb-2">
              {editingJob ? '✏️ Edit Job Opening' : '💼 Publish New Job opening'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold text-slateDark-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  {...register('title', { required: true })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Department</label>
                  <select
                    {...register('departmentId', { required: true })}
                    className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Hiring Manager</label>
                  <select
                    {...register('hiringManagerId', { required: true })}
                    className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none cursor-pointer"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Position Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="OPEN">Open (Active)</option>
                    <option value="CLOSED">Closed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Job Description</label>
                <textarea
                  placeholder="Outline roles, scope, and daily tasks..."
                  rows="3"
                  {...register('description', { required: true })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Skills & Requirements</label>
                <textarea
                  placeholder="e.g. 5+ years React experience, TypeScript, CI/CD knowledge"
                  rows="2"
                  {...register('requirements')}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slateDark-905 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black transition-all"
                >
                  Confirm Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
