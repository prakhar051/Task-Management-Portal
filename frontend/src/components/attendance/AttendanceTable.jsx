import React from 'react';

export default function AttendanceTable({ logs }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'HALF_DAY':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'LEAVE':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'ABSENT':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-slateDark-900 text-slateDark-400 border-slateDark-800';
    }
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
      <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5">Clock In</th>
              <th className="py-3.5 px-5">Clock Out</th>
              <th className="py-3.5 px-5">Regular Hours</th>
              <th className="py-3.5 px-5">Overtime</th>
              <th className="py-3.5 px-5">Break Duration</th>
              <th className="py-3.5 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slateDark-900/10 transition-colors">
                <td className="py-3.5 px-5 font-mono text-white">
                  {new Date(log.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </td>
                <td className="py-3.5 px-5 font-mono text-slateDark-300">
                  {log.clockIn
                    ? new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '-- : --'}
                </td>
                <td className="py-3.5 px-5 font-mono text-slateDark-300">
                  {log.clockOut
                    ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '-- : --'}
                </td>
                <td className="py-3.5 px-5 font-mono text-white">{log.totalHours} hrs</td>
                <td className="py-3.5 px-5 font-mono text-amber-400">
                  {log.overtimeHours > 0 ? `+${log.overtimeHours} hrs` : '0.0 hrs'}
                </td>
                <td className="py-3.5 px-5 text-slateDark-400 font-mono">{log.breakDuration} mins</td>
                <td className="py-3.5 px-5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(log.status)}`}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}

            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-slateDark-600 italic">
                  No attendance records logged in this timeframe range
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
