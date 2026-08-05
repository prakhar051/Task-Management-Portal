import React from 'react';

export default function SalaryTable({ structures, onEditClick }) {
  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-4 px-6">Employee</th>
              <th className="py-4 px-6">Designation</th>
              <th className="py-4 px-6">Base Salary</th>
              <th className="py-4 px-6">Currency</th>
              <th className="py-4 px-6">Components Count</th>
              <th className="py-4 px-6">Effective From</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
            {structures.map((struct) => (
              <tr key={struct.id} className="hover:bg-slateDark-900/10 transition-colors">
                <td className="py-4 px-6 font-bold text-white">
                  {struct.employee?.firstName} {struct.employee?.lastName}
                </td>
                <td className="py-4 px-6 text-slateDark-300">{struct.employee?.designation}</td>
                <td className="py-4 px-6 font-mono text-white">${struct.baseSalary.toLocaleString()}</td>
                <td className="py-4 px-6 font-mono text-slateDark-400">{struct.currency}</td>
                <td className="py-4 px-6 text-slateDark-400">{struct.components?.length || 0}</td>
                <td className="py-4 px-6 font-mono text-slateDark-400">
                  {new Date(struct.effectiveFrom).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => onEditClick(struct)}
                    className="px-3.5 py-1.5 bg-slateDark-905 border border-slateDark-800 hover:border-slateDark-750 text-brand-400 hover:text-white rounded-xl text-[10px] font-black transition-all"
                  >
                    ✏️ Configure
                  </button>
                </td>
              </tr>
            ))}

            {structures.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center text-xs text-slateDark-600 italic">
                  No employee salary structures registered in directories
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
