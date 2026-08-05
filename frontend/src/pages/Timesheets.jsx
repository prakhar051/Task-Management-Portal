import React, { useEffect, useState } from 'react';
import { useTimesheetStore } from '../store/timesheetStore';
import TimesheetTable from '../components/attendance/TimesheetTable';
import AttendanceToolbar from '../components/attendance/AttendanceToolbar';

export default function Timesheets() {
  const timesheets = useTimesheetStore((state) => state.timesheets);
  const fetchTimesheets = useTimesheetStore((state) => state.fetchTimesheets);
  const exportTimesheetsCSV = useTimesheetStore((state) => state.exportTimesheetsCSV);

  const [year, setYear] = useState(new Date().getUTCFullYear());
  const [month, setMonth] = useState(new Date().getUTCMonth() + 1);

  useEffect(() => {
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString().split('T')[0];

    fetchTimesheets({ startDate: start, endDate: end });
  }, [fetchTimesheets, year, month]);

  const handleChangeDate = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleExport = () => {
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString().split('T')[0];
    exportTimesheetsCSV({ startDate: start, endDate: end });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Timesheets</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Timesheet Directories</h1>
        </div>
      </div>

      {/* Toolbar filters and export */}
      <AttendanceToolbar
        year={year}
        month={month}
        onChangeDate={handleChangeDate}
        onExport={handleExport}
        showExport={true}
      />

      {/* Main Aggregates Grid */}
      <TimesheetTable timesheets={timesheets} />
    </div>
  );
}
