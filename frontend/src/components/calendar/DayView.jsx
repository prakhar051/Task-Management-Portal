import React from 'react';
import EventCard from './EventCard';

export default function DayView({ selectedDate, events, onEventMove }) {
  const getEventsForDay = (dayDate) => {
    const dateStr = dayDate.toISOString().split('T')[0];
    return events.filter((ev) => {
      const evStart = new Date(ev.startDate).toISOString().split('T')[0];
      const evEnd = new Date(ev.endDate).toISOString().split('T')[0];
      return dateStr >= evStart && dateStr <= evEnd;
    });
  };

  const dayEvents = getEventsForDay(selectedDate);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { id, type } = JSON.parse(dataStr);
      
      const targetStart = new Date(selectedDate);
      targetStart.setHours(9, 0, 0);
      const targetEnd = new Date(selectedDate);
      targetEnd.setHours(17, 0, 0);

      onEventMove(id, type, targetStart.toISOString(), targetEnd.toISOString());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 flex flex-col min-w-0 min-h-[400px] border border-slateDark-900 bg-slateDark-950/20 rounded-2xl p-6 space-y-4 select-none"
    >
      <div className="border-b border-slateDark-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-extrabold text-white text-sm">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-[10px] text-slateDark-500 font-semibold mt-0.5">
            Hourly events agenda checklist for the selected date
          </p>
        </div>
        <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-xl leading-none">
          {dayEvents.length} Event{dayEvents.length !== 1 ? 's' : ''} Today
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 max-h-[450px]">
        {dayEvents.map((ev) => (
          <div key={ev.id} className="p-3 bg-slateDark-900/40 border border-slateDark-900 rounded-xl flex items-center justify-between hover:border-slateDark-800 transition-all">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">{ev.title}</span>
                {ev.code && (
                  <span className="font-mono text-[8px] bg-slateDark-950 px-1.5 py-0.5 rounded leading-none text-slateDark-400">
                    {ev.code}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slateDark-400 font-semibold">{ev.description || 'No description provided'}</p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <span className="text-[9px] text-slateDark-400 font-bold bg-slateDark-950 px-2 py-0.5 rounded border border-slateDark-800">
                {ev.type}
              </span>
              <span className="text-[8px] text-slateDark-500 font-mono font-semibold">
                {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {dayEvents.length === 0 && (
          <div className="h-64 flex items-center justify-center text-xs text-slateDark-600 italic">
            No events scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
}
