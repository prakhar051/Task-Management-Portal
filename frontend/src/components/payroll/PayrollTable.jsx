import React from 'react';
import { Link } from 'react-router-dom';

export default function PayrollTable({ payrolls, onApprove, onPay, onCancel }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'APPROVED':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'DRAFT':
        return 'bg-slateDark-900 border-slateDark-800 text-slateDark-400';
      case 'GENERATED':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'CANCELLED':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-slateDark-900 text-slateDark-400';
    }
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
      <div className="max-h-[450px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-4 px-6">Payroll Period</th>
              <th className="py-4 px-6">Year</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Calculated Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
            {payrolls.map((pr) => (
              <tr key={pr.id} className="hover:bg-slateDark-900/10 transition-colors">
                <td className="py-4 px-6 font-bold text-white">
                  <Link to={`/payroll/${pr.id}`} className="hover:text-brand-400">
                    📅 {getMonthName(pr.month)}
                  </Link>
                </td>
                <td className="py-4 px-6 font-mono text-slateDark-300">{pr.year}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(pr.status)}`}>
                    {pr.status}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono text-slateDark-400">
                  {new Date(pr.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <Link
                    to={`/payroll/${pr.id}`}
                    className="px-3 py-1.5 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-300 hover:text-white rounded-xl text-[10px] font-black transition-all inline-block"
                  >
                    View Items
                  </Link>
                  {pr.status === 'DRAFT' && (
                    <button
                      onClick={() => onApprove(pr.id)}
                      className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[10px] font-black transition-all"
                    >
                      Approve Run
                    </button>
                  )}
                  {pr.status === 'APPROVED' && (
                    <button
                      onClick={() => onPay(pr.id)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black transition-all"
                    >
                      Disburse Paid
                    </button>
                  )}
                  {pr.status === 'DRAFT' && (
                    <button
                      onClick={() => onCancel(pr.id)}
                      className="px-3 py-1.5 border border-slateDark-800 hover:border-red-500/20 text-slateDark-400 hover:text-red-400 rounded-xl text-[10px] font-black transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {payrolls.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-xs text-slateDark-600 italic">
                  No monthly payroll runs generated yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
