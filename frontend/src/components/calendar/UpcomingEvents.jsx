import React, { useEffect } from 'react';
import { useCalendarStore } from '../../store/calendarStore';

export default function UpcomingEvents() {
  const upcomingEvents = useCalendarStore((state) => state.upcomingEvents);
  const fetchUpcoming = useCalendarStore((state) => state.fetchUpcoming);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-4.5 space-y-4 shadow-lg select-none">
      <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
        🔔 Upcoming Agenda
      </h3>
      <div className="space-y-3">
        {upcomingEvents.slice(0, 5).map((ev) => (
          <div key={ev.id} className="space-y-1">
            <div className="flex justify-between items-center text-[10.5px]">
              <span className="font-bold text-white truncate max-w-[130px]" title={ev.title}>
                {ev.title}
              </span>
              <span className="font-mono text-brand-400 font-bold">
                {new Date(ev.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
            {ev.description && (
              <p className="text-[9px] text-slateDark-500 font-semibold truncate">
                {ev.description}
              </p>
            )}
          </div>
        ))}

        {upcomingEvents.length === 0 && (
          <p className="text-[10px] text-slateDark-600 italic text-center py-2">
            No upcoming events scheduled
          </p>
        )}
      </div>
    </div>
  );
}
