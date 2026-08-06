import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCandidateStore } from '../store/candidateStore';
import { useJobStore } from '../store/jobStore';
import CandidateTable from '../components/recruitment/CandidateTable';
import SearchFilters from '../components/recruitment/SearchFilters';

export default function Candidates() {
  const candidates = useCandidateStore((state) => state.candidates);
  const fetchCandidates = useCandidateStore((state) => state.fetchCandidates);
  const createCandidate = useCandidateStore((state) => state.createCandidate);

  const jobs = useJobStore((state) => state.jobs);
  const fetchJobs = useJobStore((state) => state.fetchJobs);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [fetchCandidates, fetchJobs]);

  const openCreateModal = () => {
    reset({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobOpeningId: jobs[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    const success = await createCandidate({
      ...data,
      status: 'APPLIED'
    });
    if (success) {
      setIsModalOpen(false);
      reset();
    }
  };

  // Filter logic
  const filteredCandidates = candidates.filter((c) => {
    const nameMatch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'ALL' || c.status === statusFilter;
    return nameMatch && statusMatch;
  });

  return (
    <div className="space-y-6 select-none pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-white">Applicants Pipeline</h1>
          <p className="text-slateDark-400 text-xs mt-0.5">Register new applicants and oversee current candidate stages.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-xs font-black transition-all shadow-md"
        >
          ➕ Register Applicant
        </button>
      </div>

      <SearchFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <CandidateTable
        candidates={filteredCandidates}
        onEditClick={(c) => {
          // Redirect or handle stage edit inline
          window.location.href = `/recruitment/candidates/${c.id}`;
        }}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slateDark-955 border border-slateDark-900 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slateDark-500 hover:text-white">✕</button>

            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slateDark-900 pb-2">
              👤 Register Applicant Profile
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold text-slateDark-300">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">First Name</label>
                  <input
                    type="text"
                    {...register('firstName', { required: true })}
                    className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Last Name</label>
                  <input
                    type="text"
                    {...register('lastName', { required: true })}
                    className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  {...register('email', { required: true })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone', { required: true })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Target position opening</label>
                <select
                  {...register('jobOpeningId', { required: true })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none cursor-pointer"
                >
                  {jobs.filter((j) => j.status === 'OPEN').map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
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
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
