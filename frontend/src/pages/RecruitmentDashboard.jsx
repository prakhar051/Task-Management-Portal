import React, { useEffect } from 'react';
import { useCandidateStore } from '../store/candidateStore';
import { useJobStore } from '../store/jobStore';
import RecruitmentCharts from '../components/recruitment/RecruitmentCharts';

export default function RecruitmentDashboard() {
  const candidates = useCandidateStore((state) => state.candidates);
  const fetchCandidates = useCandidateStore((state) => state.fetchCandidates);

  const jobs = useJobStore((state) => state.jobs);
  const fetchJobs = useJobStore((state) => state.fetchJobs);

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, [fetchCandidates, fetchJobs]);

  const totalCandidates = candidates.length;
  const openPositions = jobs.filter((j) => j.status === 'OPEN').length;
  const hiredCount = candidates.filter((c) => c.status === 'HIRED').length;
  const rejectionCount = candidates.filter((c) => c.status === 'REJECTED').length;

  const conversionRate = totalCandidates > 0 ? (hiredCount / totalCandidates) * 100 : 0;

  return (
    <div className="space-y-6 select-none pb-12">
      <div>
        <h1 className="text-xl font-black text-white">ATS Dashboard</h1>
        <p className="text-slateDark-400 text-xs mt-0.5">Unified recruitment insights and hiring status metrics.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider">Active Openings</span>
          <div className="text-xl font-black text-white">{openPositions}</div>
        </div>

        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider">Total Applicants</span>
          <div className="text-xl font-black text-brand-400">{totalCandidates}</div>
        </div>

        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider">Hires Finalised</span>
          <div className="text-xl font-black text-emerald-400">{hiredCount}</div>
        </div>

        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider">Conversion Ratio</span>
          <div className="text-xl font-black text-white font-mono">{conversionRate.toFixed(1)}%</div>
        </div>
      </div>

      <RecruitmentCharts candidates={candidates} />

      <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Hiring Pipeline Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-slateDark-400">
          <div className="bg-slateDark-905/30 border border-slateDark-900 p-4 rounded-2xl flex justify-between items-center">
            <span>Interview stages</span>
            <span className="text-white text-sm font-black">
              {candidates.filter((c) => c.status === 'INTERVIEW').length} Candidates
            </span>
          </div>

          <div className="bg-slateDark-905/30 border border-slateDark-900 p-4 rounded-2xl flex justify-between items-center">
            <span>Offers Issued</span>
            <span className="text-blue-400 text-sm font-black">
              {candidates.filter((c) => c.status === 'OFFERED').length} Candidates
            </span>
          </div>

          <div className="bg-slateDark-905/30 border border-slateDark-900 p-4 rounded-2xl flex justify-between items-center">
            <span>Rejected / Withdrawn</span>
            <span className="text-red-400 text-sm font-black">{rejectionCount} Candidates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
