import React, { useState } from 'react';

export default function ApprovalQueue({ requests, onApprove, onReject, isLoading }) {
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  const handleReject = async (id) => {
    if (!rejectReason.trim()) return;
    try {
      await onReject(id, rejectReason);
      setRejectId(null);
      setRejectReason('');
    } catch (err) {
      alert(err.message);
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4 select-none">
      <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
        📥 Pending Review Requests ({pendingRequests.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingRequests.map((r) => (
          <div
            key={r.id}
            className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 space-y-4 shadow-md"
          >
            <div className="flex justify-between items-center border-b border-slateDark-900/60 pb-3">
              <div>
                <h4 className="text-xs font-black text-white">
                  {r.employee?.firstName} {r.employee?.lastName}
                </h4>
                <span className="text-[9px] text-slateDark-500 font-mono font-semibold">
                  Date: {new Date(r.date).toLocaleDateString()}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black border border-amber-500/30 bg-amber-500/10 text-amber-400">
                PENDING
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="bg-slateDark-900/40 border border-slateDark-900/60 p-2.5 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-slateDark-500 uppercase block">Original Logs</span>
                <p className="text-slateDark-400 font-mono">
                  In: {formatTime(r.originalClockIn)}
                </p>
                <p className="text-slateDark-400 font-mono">
                  Out: {formatTime(r.originalClockOut)}
                </p>
              </div>

              <div className="bg-brand-500/5 border border-brand-500/20 p-2.5 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-brand-400 uppercase block">Requested Logs</span>
                <p className="text-white font-mono">
                  In: {formatTime(r.requestedClockIn)}
                </p>
                <p className="text-white font-mono">
                  Out: {formatTime(r.requestedClockOut)}
                </p>
              </div>
            </div>

            <div className="text-xs">
              <span className="text-[9.5px] font-black text-slateDark-500 uppercase block mb-1">Reason justification</span>
              <p className="text-slateDark-300 italic">"{r.reason}"</p>
            </div>

            {rejectId === r.id ? (
              <div className="space-y-3 pt-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Specify reason for rejection..."
                  rows={2}
                  className="w-full px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setRejectId(null)}
                    className="px-3 py-1 border border-slateDark-850 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-[10px] font-bold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    disabled={isLoading || !rejectReason.trim()}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setRejectId(r.id)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-slateDark-800 hover:border-red-500/20 text-slateDark-400 hover:text-red-400 rounded-xl text-[11px] font-bold transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(r.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 border border-emerald-500 hover:border-emerald-600 text-white rounded-xl text-[11px] font-bold transition-all shadow-md shadow-emerald-500/10"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}

        {pendingRequests.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-slateDark-600 italic">
            No correction requests pending approval reviews
          </div>
        )}
      </div>
    </div>
  );
}
