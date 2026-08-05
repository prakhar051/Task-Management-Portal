import React from 'react';

export default function AttendanceCard({ summary }) {
  const cards = [
    {
      title: 'Monthly Working Hours',
      value: summary?.totalWorkingHours ? `${summary.totalWorkingHours} hrs` : '0 hrs',
      description: `Target: ${summary?.totalWorkingDaysCount * 8 || 0} hrs`,
      icon: '⏱️',
      color: 'text-brand-400'
    },
    {
      title: 'Attendance Rate',
      value: summary?.attendancePercentage ? `${summary.attendancePercentage}%` : '0%',
      description: `Active days: ${summary?.presentDays || 0}d / leave days: ${summary?.leaveDays || 0}d`,
      icon: '📈',
      color: 'text-emerald-400'
    },
    {
      title: 'Avg Check-In',
      value: summary?.avgCheckInTime || '09:00',
      description: 'Typical clock-in time',
      icon: '🌅',
      color: 'text-amber-400'
    },
    {
      title: 'Avg Check-Out',
      value: summary?.avgCheckOutTime || '17:00',
      description: 'Typical clock-out time',
      icon: '🌇',
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-5 flex items-center space-x-4 shadow-md backdrop-blur-md"
        >
          <span className="text-2xl">{c.icon}</span>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider block">
              {c.title}
            </span>
            <span className="text-lg font-black text-white block leading-none">
              {c.value}
            </span>
            <span className="text-[9px] text-slateDark-400 font-semibold block">
              {c.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
