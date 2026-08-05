import React from 'react';

export default function TimesheetTable({ timesheets }) {
  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-4 px-6">Employee</th>
              <th className="py-4 px-6">Designation</th>
              <th className="py-4 px-6">Timesheet Period</th>
              <th className="py-4 px-6">Regular Hours</th>
              <th className="py-4 px-6">Overtime Hours</th>
              <th className="py-4 px-6">Attendance Rate</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs">
            {timesheets.map((ts) => (
              <tr key={ts.id} className="hover:bg-slateDark-900/10 transition-colors">
                <td className="py-4 px-6 font-bold text-white">
                  {ts.employee?.firstName} {ts.employee?.lastName}
                </td>
                <td className="py-4 px-6 text-slateDark-300 font-semibold">{ts.employee?.designation}</td>
                <td className="py-4 px-6 font-mono text-slateDark-400">
                  {new Date(ts.startDate).toLocaleDateString()} - {new Date(ts.endDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 font-mono text-white font-bold">{ts.totalRegularHours} hrs</td>
                <td className="py-4 px-6 font-mono text-amber-400 font-bold">+{ts.totalOvertimeHours} hrs</td>
                <td className="py-4 px-6 font-mono text-brand-400 font-black">{ts.attendancePercentage}%</td>
                <td className="py-4 px-6">
                  <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 uppercase tracking-wide">
                    {ts.status}
                  </span>
                </td>
              </tr>
            ))}

            {timesheets.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-xs text-slateDark-600 italic">
                  No employee timesheets compiled in this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
