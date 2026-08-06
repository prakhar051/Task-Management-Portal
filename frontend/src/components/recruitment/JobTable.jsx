import React from 'react';
import { Link } from 'react-router-dom';

export default function JobTable({ jobs, onEditClick, onDeleteClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'CLOSED':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'DRAFT':
        return 'bg-slateDark-900 border-slateDark-800 text-slateDark-400';
      case 'CANCELLED':
        return 'bg-slateDark-900 border-slateDark-800 text-slateDark-500 line-through';
      default:
        return 'bg-slateDark-900 text-slateDark-400';
    }
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-4 px-6">Job Title</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6">Hiring Manager</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Applicants</th>
              <th className="py-4 px-6">Published Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-slateDark-900/10 transition-colors">
                <td className="py-4 px-6 font-bold text-white">
                  <Link to={`/recruitment/jobs/${job.id}`} className="hover:text-brand-400">
                    💼 {job.title}
                  </Link>
                </td>
                <td className="py-4 px-6 text-slateDark-300">{job.department?.name}</td>
                <td className="py-4 px-6 text-slateDark-400">
                  👨‍💼 {job.hiringManager?.firstName} {job.hiringManager?.lastName}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono text-white">{job._count?.candidates || 0}</td>
                <td className="py-4 px-6 font-mono text-slateDark-400">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  <button
                    onClick={() => onEditClick(job)}
                    className="px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-300 hover:text-white rounded-xl text-[10px] font-black transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => onDeleteClick(job.id)}
                    className="px-3 py-1.5 border border-slateDark-800 hover:border-red-500/20 text-slateDark-400 hover:text-red-400 rounded-xl text-[10px] font-black transition-all"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}

            {jobs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-xs text-slateDark-600 italic">
                  No active job openings registered in system
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
