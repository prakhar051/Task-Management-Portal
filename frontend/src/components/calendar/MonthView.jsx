import React from 'react';
import EventCard from './EventCard';

export default function MonthView({ selectedDate, events, onEventMove }) {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Number of days in month
    const daysCount = new Date(year, month + 1, 0).getDate();
    // Offset for week days start (0 for Sunday, 6 for Saturday)
    const startDayIndex = firstDay.getDay();

    const days = [];
    
    // Prefix padding days from previous month
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDaysCount - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysCount; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Suffix padding days from next month to make perfect grid of 35 or 42 cells
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Filter events matching the specific day
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
      
      // Preserve event time parameters if possible, or set default time
      const targetStart = new Date(targetDate);
      targetStart.setHours(9, 0, 0); // 9 AM default
      const targetEnd = new Date(targetDate);
      targetEnd.setHours(17, 0, 0); // 5 PM default

      onEventMove(id, type, targetStart.toISOString(), targetEnd.toISOString());
    } catch (err) {
      console.error('Drag-drop parsing failure', err);
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
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-slateDark-900 pb-2">
        {weekdays.map((day) => (
          <div key={day} className="text-center text-[10px] font-extrabold uppercase tracking-wider text-slateDark-500">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1 border-r border-b border-slateDark-900/60 mt-1 min-h-[500px]">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day.date);
          return (
            <div
              key={idx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.date)}
              className={`border-l border-t border-slateDark-900/60 p-1.5 flex flex-col space-y-1.5 min-h-[85px] transition-colors relative ${
                day.isCurrentMonth ? 'bg-slateDark-950/20' : 'bg-slateDark-950/40 opacity-45'
              } ${isToday(day.date) ? 'bg-slateDark-900/30' : ''}`}
            >
              {/* Date text index */}
              <div className="flex justify-between items-center">
                <span
                  className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday(day.date)
                      ? 'bg-brand-500 text-white shadow-md'
                      : day.isCurrentMonth
                      ? 'text-slateDark-300'
                      : 'text-slateDark-600'
                  }`}
                >
                  {day.date.getDate()}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-[7.5px] font-extrabold text-brand-400 bg-brand-500/10 px-1 py-0.5 rounded leading-none">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>

              {/* Day Events Feed */}
              <div className="flex-1 overflow-y-auto space-y-1 max-h-[70px] pr-0.5 scrollbar-thin">
                {dayEvents.slice(0, 3).map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
