import React from 'react';
import CandidateCard from './CandidateCard';

export default function PipelineBoard({ candidates, onMoveStage, stages }) {
  // Safe default fallback stages list if stages are not loaded:
  const pipelineStages = stages.length > 0 ? stages.map((s) => s.name.toUpperCase()) : [
    'APPLIED',
    'SCREENING',
    'SHORTLISTED',
    'INTERVIEW',
    'OFFERED',
    'HIRED'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
      {pipelineStages.map((stage) => {
        const stageCandidates = candidates.filter((c) => c.status === stage);

        return (
          <div key={stage} className="bg-slateDark-950/20 border border-slateDark-900 rounded-3xl p-4 flex flex-col space-y-4 max-h-[70vh] overflow-y-auto min-w-[200px]">
            <div className="flex justify-between items-center border-b border-slateDark-900 pb-2">
              <span className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">
                📋 {stage.toLowerCase()}
              </span>
              <span className="h-5 w-5 bg-slateDark-900 text-slateDark-400 border border-slateDark-800 text-[10px] font-black flex items-center justify-center rounded-full">
                {stageCandidates.length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto scrollbar-none">
              {stageCandidates.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  onMoveStage={onMoveStage}
                />
              ))}

              {stageCandidates.length === 0 && (
                <div className="py-12 text-center text-[10px] font-semibold text-slateDark-600 italic border border-dashed border-slateDark-900/60 rounded-2xl">
                  Lanes empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
