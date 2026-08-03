import React, { useEffect, useState } from 'react';
import { useLeaveStore } from '../store/leaveStore';
import { useAuthStore } from '../store/authStore';
import ApprovalModal from '../components/calendar/ApprovalModal';

export default function LeaveManagement() {
  const user = useAuthStore((state) => state.user);

  const leaves = useLeaveStore((state) => state.leaves);
  const isLoading = useLeaveStore((state) => state.isLoading);
  const error = useLeaveStore((state) => state.error);

  const fetchLeaves = useLeaveStore((state) => state.fetchLeaves);
  const approveLeave = useLeaveStore((state) => state.approveLeaveRequest);
  const rejectLeave = useLeaveStore((state) => state.rejectLeaveRequest);
  const cancelLeave = useLeaveStore((state) => state.cancelLeaveRequest);

  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED'
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const filteredLeaves = leaves.filter((l) => {
    if (activeTab === 'ALL') return true;
    return l.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'REJECTED':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'CANCELLED':
        return 'bg-slateDark-800 text-slateDark-400 border-slateDark-750';
      default:
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    }
  };

  const handleReview = (leave) => {
    setSelectedLeave(leave);
    setIsReviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Leaves</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Leave Management</h1>
        </div>
        <div className="text-xs text-slateDark-400 font-bold bg-slateDark-900 px-3 py-1.5 rounded-xl border border-slateDark-800 font-mono">
          Approver role: {user?.role || 'Guest'}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slateDark-900/40 border border-slateDark-900 rounded-2xl p-1 w-fit select-none">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-xs font-extrabold capitalize rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slateDark-400 hover:text-white'
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {isLoading && leaves.length === 0 && (
        <div className="min-h-[30vh] flex items-center justify-center text-xs animate-pulse text-slateDark-500 font-bold">
          Retrieving leaves directory logs...
        </div>
      )}

      <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slateDark-900/60 bg-slateDark-950/20 text-[10px] font-extrabold text-slateDark-400 uppercase tracking-wider select-none">
                <th className="py-4 px-6">Employee</th>
                <th className="py-4 px-6">Leave Category</th>
                <th className="py-4 px-6">Duration Dates</th>
                <th className="py-4 px-6">Reason Details</th>
                <th className="py-4 px-6">Status State</th>
                <th className="py-4 px-6 text-right">Actions Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slateDark-900/60 text-xs">
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slateDark-900/10 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">
                    {leave.employee?.firstName} {leave.employee?.lastName}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slateDark-300 font-bold uppercase">
                    {leave.type}
                  </td>
                  <td className="py-4 px-6 text-slateDark-300 font-mono font-semibold">
                    {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-slateDark-400 max-w-[200px] truncate" title={leave.reason}>
                    {leave.reason}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black border leading-none tracking-wider ${getStatusBadge(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2 select-none">
                    {leave.status === 'PENDING' && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                      <button
                        onClick={() => handleReview(leave)}
                        className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-600 border border-brand-500 text-white rounded-xl text-[10px] font-bold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all"
                      >
                        Review
                      </button>
                    )}

                    {leave.status === 'APPROVED' && (
                      <button
                        onClick={() => cancelLeave(leave.id)}
                        className="px-3.5 py-1.5 border border-slateDark-800 hover:border-red-500/20 hover:bg-red-500/5 text-slateDark-400 hover:text-red-400 rounded-xl text-[10px] font-bold transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slateDark-600 italic">
                    No leave requests found in this scope category
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ApprovalModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        leave={selectedLeave}
        onApprove={approveLeave}
        onReject={rejectLeave}
        isLoading={isLoading}
        apiError={error}
      />
    </div>
  );
}
