import React from 'react';
import { Link } from 'react-router-dom';

export default function CandidateCard({ candidate, onMoveStage }) {
  const nextStagesMap = {
    APPLIED: 'SCREENING',
    SCREENING: 'SHORTLISTED',
    SHORTLISTED: 'INTERVIEW',
    INTERVIEW: 'OFFERED',
    OFFERED: 'HIRED'
  };

  const nextStage = nextStagesMap[candidate.status];

  return (
    <div className="bg-slateDark-905 border border-slateDark-850 p-4 rounded-2xl space-y-3 shadow-md hover:border-slateDark-800 transition-all select-none">
      <div>
        <Link to={`/recruitment/candidates/${candidate.id}`} className="text-xs font-black text-white hover:text-brand-400 block leading-tight">
          👤 {candidate.firstName} {candidate.lastName}
        </Link>
        <span className="text-[10px] text-slateDark-400 font-semibold mt-1 block">
          Target Position: {candidate.job?.title}
        </span>
      </div>

      <div className="text-[10px] font-semibold text-slateDark-500 font-mono space-y-0.5">
        <div>📧 {candidate.email}</div>
        <div>📞 {candidate.phone}</div>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slateDark-900/60">
        <Link
          to={`/recruitment/candidates/${candidate.id}`}
          className="text-[9px] font-black text-slateDark-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          View Profile
        </Link>
        {nextStage && (
          <button
            onClick={() => onMoveStage(candidate.id, nextStage)}
            className="px-2.5 py-1 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-[9px] font-black transition-all"
          >
            Advance ➔
          </button>
        )}
      </div>
    </div>
  );
}
