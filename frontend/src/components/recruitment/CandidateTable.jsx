import React from 'react';
import { Link } from 'react-router-dom';

export default function CandidateTable({ candidates, onEditClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'HIRED':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'OFFERED':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'INTERVIEW':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'SHORTLISTED':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'REJECTED':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-slateDark-900 border-slateDark-800 text-slateDark-400';
    }
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-4 px-6">Candidate Name</th>
              <th className="py-4 px-6">Position</th>
              <th className="py-4 px-6">Email Address</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6">Pipeline Status</th>
              <th className="py-4 px-6">Applied Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
            {candidates.map((cand) => (
              <tr key={cand.id} className="hover:bg-slateDark-900/10 transition-colors">
                <td className="py-4 px-6 font-bold text-white">
                  <Link to={`/recruitment/candidates/${cand.id}`} className="hover:text-brand-400">
                    👤 {cand.firstName} {cand.lastName}
                  </Link>
                </td>
                <td className="py-4 px-6 text-slateDark-300">{cand.job?.title}</td>
                <td className="py-4 px-6 font-mono text-slateDark-400">{cand.email}</td>
                <td className="py-4 px-6 font-mono text-slateDark-400">{cand.phone}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(cand.status)}`}>
                    {cand.status}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono text-slateDark-400">
                  {new Date(cand.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onEditClick(cand)}
                    className="px-3.5 py-1.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-brand-400 hover:text-white rounded-xl text-[10px] font-black transition-all"
                  >
                    ✏️ Move Stage
                  </button>
                </td>
              </tr>
            ))}

            {candidates.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-xs text-slateDark-600 italic">
                  No applicants registered in this queue
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
