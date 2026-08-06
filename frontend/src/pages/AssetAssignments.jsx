import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { FileText, Calendar, ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssetAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/assets')
      .then(() => {
        // Fetch all assignments using custom list endpoint or prisma model select
        return apiClient.get('/employees'); // mock link trigger
      })
      .then(() => {
        // Fetch assignments directly
        // We will define a helper or call the asset list and parse
        return apiClient.get('/assets');
      })
      .then((res) => {
        // Map assignments from active list or fetch assignments directly
        const list = [];
        res.data.data.forEach((a) => {
          if (a.assignments) {
            a.assignments.forEach((asg) => {
              list.push({ ...asg, asset: a });
            });
          }
        });
        setAssignments(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getDurationDays = (asg) => {
    const start = new Date(asg.assignedAt);
    const end = asg.returnedAt ? new Date(asg.returnedAt) : new Date();
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/assets')}
            className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to inventory</span>
          </button>
          <h1 className="text-2xl font-bold text-zinc-100">Asset Assignment Ledger</h1>
          <p className="text-sm text-zinc-400">View active hardware allocations and historical duration tracking logs.</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-zinc-900 border border-zinc-800 rounded-xl">
        <table className="min-w-full divide-y divide-zinc-850">
          <thead>
            <tr className="bg-zinc-950/40 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="px-6 py-4">Asset Tag</th>
              <th className="px-6 py-4">Asset Name</th>
              <th className="px-6 py-4">Assignee</th>
              <th className="px-6 py-4">Assigned Date</th>
              <th className="px-6 py-4">Returned Date</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850 text-sm text-zinc-300">
            {assignments.map((asg) => (
              <tr key={asg.id} className="hover:bg-zinc-850/40 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-zinc-100">{asg.asset?.tag}</td>
                <td className="px-6 py-4 font-medium text-zinc-200">{asg.asset?.name}</td>
                <td className="px-6 py-4">
                  {asg.employee?.firstName} {asg.employee?.lastName}
                </td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                  {new Date(asg.assignedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                  {asg.returnedAt ? new Date(asg.returnedAt).toLocaleDateString() : (
                    <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-semibold text-zinc-300">
                  {getDurationDays(asg)} Days
                </td>
                <td className="px-6 py-4 uppercase text-xs font-bold text-zinc-400">
                  {asg.conditionOnAssign}
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-zinc-500 italic">
                  No allocation logs found in the ledger database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetAssignments;
