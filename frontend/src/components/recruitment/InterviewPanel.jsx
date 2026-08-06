import React from 'react';

export default function InterviewPanel({ panelMembers }) {
  return (
    <div className="space-y-2 select-none text-xs font-semibold">
      <span className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">
        👥 Panel Interviewers
      </span>
      <div className="flex flex-wrap gap-2">
        {panelMembers?.map((m) => (
          <div
            key={m.id}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slateDark-905 border border-slateDark-800 rounded-xl"
          >
            <div className="h-5 w-5 bg-brand-500/20 text-brand-400 text-[10px] font-black flex items-center justify-center rounded-full">
              {m.employee?.firstName.charAt(0)}
            </div>
            <span className="text-white text-xs font-semibold">
              {m.employee?.firstName} {m.employee?.lastName}
            </span>
          </div>
        ))}

        {(!panelMembers || panelMembers.length === 0) && (
          <span className="text-xs text-slateDark-500 font-semibold italic">No interviewers assigned to this panel</span>
        )}
      </div>
    </div>
  );
}
