import React, { useEffect, useState } from 'react';
import { useAttendanceStore } from '../store/attendanceStore';
import { useTimesheetStore } from '../store/timesheetStore';
import { useAuthStore } from '../store/authStore';
import ClockWidget from '../components/attendance/ClockWidget';
import BreakTimer from '../components/attendance/BreakTimer';
import AttendanceCard from '../components/attendance/AttendanceCard';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import AttendanceTable from '../components/attendance/AttendanceTable';
import AttendanceRequestModal from '../components/attendance/AttendanceRequestModal';
import ApprovalQueue from '../components/attendance/ApprovalQueue';
import AttendanceToolbar from '../components/attendance/AttendanceToolbar';

export default function Attendance() {
  const user = useAuthStore((state) => state.user);

  const logs = useAttendanceStore((state) => state.logs);
  const requests = useAttendanceStore((state) => state.requests);
  const isLoading = useAttendanceStore((state) => state.isLoading);
  const error = useAttendanceStore((state) => state.error);

  const fetchLogs = useAttendanceStore((state) => state.fetchLogs);
  const fetchRequests = useAttendanceStore((state) => state.fetchRequests);
  const submitCorrection = useAttendanceStore((state) => state.submitCorrection);
  const approveRequest = useAttendanceStore((state) => state.approveRequest);
  const rejectRequest = useAttendanceStore((state) => state.rejectRequest);

  const monthlySummary = useTimesheetStore((state) => state.monthlySummary);
  const fetchMonthlySummary = useTimesheetStore((state) => state.fetchMonthlySummary);

  const [year, setYear] = useState(new Date().getUTCFullYear());
  const [month, setMonth] = useState(new Date().getUTCMonth() + 1);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  useEffect(() => {
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString().split('T')[0];

    fetchLogs({ startDate: start, endDate: end });
    fetchMonthlySummary({ year, month });

    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      fetchRequests();
    }
  }, [fetchLogs, fetchRequests, fetchMonthlySummary, year, month, user]);

  const handleChangeDate = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleCorrectionSubmit = async (data) => {
    const success = await submitCorrection(data);
    if (success) {
      // Re-fetch requests
      fetchRequests();
    }
    return success;
  };

  const handleApprove = async (id) => {
    await approveRequest(id);
    // Refresh log stats
    const start = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString().split('T')[0];
    fetchLogs({ startDate: start, endDate: end });
    fetchMonthlySummary({ year, month });
  };

  const handleReject = async (id, reason) => {
    await rejectRequest(id, reason);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Attendance</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Attendance & Time-Tracking</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCorrectionOpen(true)}
            className="px-4.5 py-2.5 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/10"
          >
            ✏️ Correction Request
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards section */}
      <AttendanceCard summary={monthlySummary} />

      {/* Date Pickers */}
      <AttendanceToolbar
        year={year}
        month={month}
        onChangeDate={handleChangeDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Widget Timers */}
        <div className="space-y-6">
          <ClockWidget />
          {monthlySummary?.logs && (
            <BreakTimer
              activeSession={
                logs.length > 0 &&
                logs[0].workSessions?.find((s) => s.status === 'ACTIVE')
              }
            />
          )}
          <AttendanceCalendar
            logs={logs}
            year={year}
            month={month}
          />
        </div>

        {/* Right logs table list */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceTable logs={logs} />

          {/* Pending Approval Reviews (Managers/Admins) */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <ApprovalQueue
              requests={requests}
              onApprove={handleApprove}
              onReject={handleReject}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Manual Request Modal */}
      <AttendanceRequestModal
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        onSubmit={handleCorrectionSubmit}
        isLoading={isLoading}
        apiError={error}
      />
    </div>
  );
}
