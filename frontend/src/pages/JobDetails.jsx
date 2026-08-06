import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobStore } from '../store/jobStore';
import { useCandidateStore } from '../store/candidateStore';
import PipelineBoard from '../components/recruitment/PipelineBoard';

export default function JobDetails() {
  const { id } = useParams();

  const activeJob = useJobStore((state) => state.activeJob);
  const fetchJobDetails = useJobStore((state) => state.fetchJobDetails);
  const stages = useJobStore((state) => state.stages);
  const fetchStages = useJobStore((state) => state.fetchStages);

  const candidates = useCandidateStore((state) => state.candidates);
  const fetchCandidates = useCandidateStore((state) => state.fetchCandidates);
  const changeStage = useCandidateStore((state) => state.changeStage);

  useEffect(() => {
    fetchJobDetails(id);
    fetchCandidates(id);
    fetchStages();
  }, [id, fetchJobDetails, fetchCandidates, fetchStages]);

  const handleMoveStage = async (candidateId, nextStage) => {
    await changeStage(candidateId, nextStage);
    await fetchCandidates(id);
  };

  if (!activeJob) {
    return (
      <div className="py-24 text-center text-xs text-slateDark-500 font-semibold italic">
        Loading Job Position specifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none pb-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider block">
            💼 Job Details Workspace
          </span>
          <h1 className="text-xl font-black text-white">{activeJob.title}</h1>
        </div>
        <Link
          to="/recruitment/jobs"
          className="px-4 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
        >
          ➔ Back to Openings
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Job Description</h3>
            <p className="text-xs text-slateDark-300 font-medium leading-relaxed mt-2 whitespace-pre-wrap">
              {activeJob.description}
            </p>
          </div>

          {activeJob.requirements && (
            <div>
              <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Position Requirements</h3>
              <p className="text-xs text-slateDark-300 font-medium leading-relaxed mt-2 whitespace-pre-wrap">
                {activeJob.requirements}
              </p>
            </div>
          )}
        </div>

        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-sm space-y-4 text-xs font-semibold text-slateDark-300">
          <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Workspace Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slateDark-500">Department:</span>
              <span className="text-white font-bold">{activeJob.department?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Hiring Manager:</span>
              <span className="text-white font-bold">
                {activeJob.hiringManager?.firstName} {activeJob.hiringManager?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Total Applicants:</span>
              <span className="text-white font-mono">{candidates.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Status:</span>
              <span className="text-white uppercase font-black">{activeJob.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Visual Candidate Pipeline board</h3>
        <PipelineBoard
          candidates={candidates}
          stages={stages}
          onMoveStage={handleMoveStage}
        />
      </div>
    </div>
  );
}
