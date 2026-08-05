import React, { useState, useEffect } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';

export default function ClockWidget() {
  const attendance = useAttendanceStore((state) => state.attendance);
  const checkIn = useAttendanceStore((state) => state.checkIn);
  const checkOut = useAttendanceStore((state) => state.checkOut);
  const startBreak = useAttendanceStore((state) => state.startBreak);
  const endBreak = useAttendanceStore((state) => state.endBreak);
  const fetchTodayAttendance = useAttendanceStore((state) => state.fetchTodayAttendance);

  const [activeSession, setActiveSession] = useState(null);
  const [elapsedStr, setElapsedStr] = useState('00:00:00');

  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  useEffect(() => {
    if (attendance?.workSessions) {
      const active = attendance.workSessions.find((s) => s.status === 'ACTIVE');
      setActiveSession(active || null);
    } else {
      setActiveSession(null);
    }
  }, [attendance]);

  // Tick timer for the active session
  useEffect(() => {
    if (!activeSession) {
      setElapsedStr('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(activeSession.startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.max(0, now - start);

      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      setElapsedStr(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleClockIn = async () => {
    try {
      await checkIn();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleClockOut = async () => {
    if (window.confirm('Are you sure you want to clock out for today?')) {
      try {
        await checkOut();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleToggleBreak = async () => {
    try {
      if (activeSession?.type === 'BREAK') {
        await endBreak();
      } else {
        await startBreak();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusText = () => {
    if (!attendance) return 'Not Checked In';
    if (activeSession?.type === 'BREAK') return 'On Break';
    if (activeSession) return 'Working';
    return 'Checked Out';
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-6 flex flex-col items-center justify-center space-y-6 shadow-xl select-none">
      <div className="text-center">
        <span className="text-[10px] font-black text-slateDark-400 uppercase tracking-widest block">
          Current State
        </span>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mt-2 border ${
            getStatusText() === 'Working'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : getStatusText() === 'On Break'
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              : 'bg-slateDark-900 border-slateDark-800 text-slateDark-400'
          }`}
        >
          {getStatusText()}
        </span>
      </div>

      {activeSession && (
        <div className="text-center space-y-1">
          <span className="text-[9.5px] font-bold text-slateDark-500 uppercase tracking-wider block">
            {activeSession.type === 'BREAK' ? 'Break Session Timer' : 'Active Working Duration'}
          </span>
          <span className="text-3xl font-black text-white font-mono tracking-widest drop-shadow-md">
            {elapsedStr}
          </span>
        </div>
      )}

      <div className="flex gap-4 w-full">
        {!attendance || (attendance && !attendance.clockIn) ? (
          <button
            onClick={handleClockIn}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 hover:border-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/10"
          >
            Clock In
          </button>
        ) : (
          <>
            {activeSession && (
              <button
                onClick={handleToggleBreak}
                className={`flex-1 py-3 border font-bold rounded-2xl transition-all ${
                  activeSession.type === 'BREAK'
                    ? 'bg-purple-500 hover:bg-purple-600 border-purple-500 text-white'
                    : 'bg-slateDark-900 hover:bg-slateDark-800 border-slateDark-800 text-slateDark-300'
                }`}
              >
                {activeSession.type === 'BREAK' ? 'End Break' : 'Start Break'}
              </button>
            )}
            {activeSession && (
              <button
                onClick={handleClockOut}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-500/10"
              >
                Clock Out
              </button>
            )}
          </>
        )}
      </div>

      {attendance?.clockIn && (
        <div className="w-full border-t border-slateDark-900/60 pt-4 grid grid-cols-2 gap-4 text-center text-xs">
          <div>
            <span className="text-[9.5px] font-black text-slateDark-500 uppercase block">Check In Time</span>
            <span className="font-mono text-white font-bold mt-1 block">
              {new Date(attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div>
            <span className="text-[9.5px] font-black text-slateDark-500 uppercase block">Check Out Time</span>
            <span className="font-mono text-white font-bold mt-1 block">
              {attendance.clockOut
                ? new Date(attendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '-- : --'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
