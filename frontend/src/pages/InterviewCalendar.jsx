import React, { useEffect } from 'react';
import { useInterviewStore } from '../store/interviewStore';

export default function InterviewCalendar() {
  const interviews = useInterviewStore((state) => state.interviews);
  const fetchInterviews = useInterviewStore((state) => state.fetchInterviews);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  return (
    <div className="space-y-6 select-none pb-12">
      <div>
        <h1 className="text-xl font-black text-white">Recruitment Calendars</h1>
        <p className="text-slateDark-400 text-xs mt-0.5">Upcoming technical, manager, and HR panel assessments list.</p>
      </div>

      <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">Interview Agenda Timeline</h3>

        <div className="space-y-3">
          {interviews.map((itm) => (
            <div
              key={itm.id}
              className="bg-slateDark-905/30 border border-slateDark-900/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="text-xs font-black text-white">
                  🗓️ {itm.title} ({itm.type})
                </h4>
                <div className="text-[10px] text-slateDark-500 font-semibold mt-1">
                  Candidate: {itm.candidate?.firstName} {itm.candidate?.lastName} | Scheduled: {new Date(itm.scheduledAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="px-2 py-0.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-md text-[9px] font-black uppercase tracking-wider">
                  {itm.status}
                </span>
                <span className="px-2 py-0.5 bg-slateDark-900 border border-slateDark-800 text-slateDark-400 rounded-md text-[9px] font-black">
                  ⏱️ {itm.durationMinutes} min
                </span>
              </div>
            </div>
          ))}

          {interviews.length === 0 && (
            <div className="py-16 text-center text-xs text-slateDark-600 italic">
              No interview rounds currently scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
