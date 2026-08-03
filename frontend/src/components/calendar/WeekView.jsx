import React from 'react';
import EventCard from './EventCard';

export default function WeekView({ selectedDate, events, onEventMove }) {
  const getDaysOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    // Offset back to Sunday
    const diff = start.getDate() - day;
    const Sunday = new Date(start.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Sunday);
      d.setDate(Sunday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const days = getDaysOfWeek(selectedDate);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventsForDay = (dayDate) => {
    const dateStr = dayDate.toISOString().split('T')[0];
    return events.filter((ev) => {
      const evStart = new Date(ev.startDate).toISOString().split('T')[0];
      const evEnd = new Date(ev.endDate).toISOString().split('T')[0];
      return dateStr >= evStart && dateStr <= evEnd;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetDate) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { id, type } = JSON.parse(dataStr);
      
      const targetStart = new Date(targetDate);
      targetStart.setHours(9, 0, 0);
      const targetEnd = new Date(targetDate);
      targetEnd.setHours(17, 0, 0);

      onEventMove(id, type, targetStart.toISOString(), targetEnd.toISOString());
    } catch (err) {
      console.error(err);
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 select-none">
      <div className="grid grid-cols-7 border-b border-slateDark-900 pb-2">
        {weekdays.map((day, idx) => (
          <div key={day} className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slateDark-500 block">
              {day}
            </span>
            <span
              className={`text-xs font-black inline-flex items-center justify-center w-6 h-6 rounded-full mt-1 ${
                isToday(days[idx]) ? 'bg-brand-500 text-white shadow-md' : 'text-slateDark-300'
              }`}
            >
              {days[idx].getDate()}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 border-r border-b border-slateDark-900/60 mt-1 min-h-[450px]">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={idx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={`border-l border-t border-slateDark-900/60 p-2.5 flex flex-col space-y-2 min-h-[350px] transition-colors ${
                isToday(day) ? 'bg-slateDark-900/10' : 'bg-slateDark-950/10'
              }`}
            >
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-thin">
                {dayEvents.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
                {dayEvents.length === 0 && (
                  <div className="h-full flex items-center justify-center text-[9px] text-slateDark-600 italic select-none">
                    No Events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
