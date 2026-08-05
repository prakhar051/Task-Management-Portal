import React from 'react';

export default function AttendanceCalendar({ logs, year, month }) {
  const getDaysInMonth = (y, m) => {
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0));
    const offset = start.getUTCDay(); // offset weekdays
    const days = [];

    // Prefix empty spacing
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }

    // Actual month days
    const daysCount = end.getUTCDate();
    for (let i = 1; i <= daysCount; i++) {
      days.push(new Date(Date.UTC(y, m - 1, i)));
    }

    return days;
  };

  const days = getDaysInMonth(year || new Date().getFullYear(), month || new Date().getMonth() + 1);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getLogForDay = (dayDate) => {
    if (!dayDate) return null;
    const dateStr = dayDate.toISOString().split('T')[0];
    return logs.find((l) => l.date.split('T')[0] === dateStr);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-500 text-white';
      case 'HALF_DAY':
        return 'bg-amber-500 text-white';
      case 'LEAVE':
        return 'bg-purple-500 text-white';
      case 'ABSENT':
        return 'bg-red-500 text-white';
      case 'HOLIDAY':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-slateDark-900 border border-slateDark-800 text-slateDark-600';
    }
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-lg select-none space-y-4">
      <div className="border-b border-slateDark-900 pb-3 flex justify-between items-center">
        <h4 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
          📅 Month Overview
        </h4>
        <div className="flex gap-3.5 text-[9.5px] font-extrabold text-slateDark-500">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 block"></span>
            <span>Present</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 block"></span>
            <span>Half</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-purple-500 block"></span>
            <span>Leave</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2.5 text-center">
        {weekdays.map((day) => (
          <span key={day} className="text-[10px] font-black uppercase tracking-wider text-slateDark-600">
            {day}
          </span>
        ))}

        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`}></div>;
          const log = getLogForDay(day);

          return (
            <div
              key={idx}
              className={`h-9 flex flex-col items-center justify-center rounded-xl text-xs font-bold font-mono transition-all ${
                log ? getStatusColor(log.status) : 'bg-slateDark-900/10 text-slateDark-600 border border-transparent'
              }`}
              title={log ? `Status: ${log.status} | Worked: ${log.totalHours} hrs` : ''}
            >
              <span>{day.getUTCDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
