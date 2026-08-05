import React, { useEffect, useState } from 'react';
import { usePayrollStore } from '../store/payrollStore';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import PayslipViewer from '../components/payroll/PayslipViewer';

export default function Payslip() {
  const user = useAuthStore((state) => state.user);

  const history = usePayrollStore((state) => state.history);
  const loading = usePayrollStore((state) => state.loading);
  const error = usePayrollStore((state) => state.error);

  const fetchHistory = usePayrollStore((state) => state.fetchHistory);
  const downloadPayslip = usePayrollStore((state) => state.downloadPayslip);

  const employees = useEmployeeStore((state) => state.employees);
  const fetchEmployees = useEmployeeStore((state) => state.fetchEmployees);

  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const currentEmp = employees.find((e) => e.userId === user.id);
    if (currentEmp) {
      fetchHistory(currentEmp.id);
    }
  }, [employees, user.id, fetchHistory]);

  const handlePreviewClick = (item) => {
    setPreviewItem(item);
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="border-b border-slateDark-900 pb-4 select-none">
        <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-white font-mono">Payslips</span>
        </div>
        <h1 className="text-xl font-extrabold text-white mt-1">My Payslip Statements</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-xs text-slateDark-500 italic">
          Fetching salary records history...
        </div>
      ) : (
        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
                <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
                  <th className="py-4 px-6">Period</th>
                  <th className="py-4 px-6">Basic Salary</th>
                  <th className="py-4 px-6">Gross Salary</th>
                  <th className="py-4 px-6">Tax</th>
                  <th className="py-4 px-6">Deductions</th>
                  <th className="py-4 px-6">Net Salary</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slateDark-900/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      📅 {getMonthName(item.payroll?.month)} {item.payroll?.year}
                    </td>
                    <td className="py-4 px-6 font-mono text-slateDark-300">${item.basicSalary.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-slateDark-300">${item.grossSalary.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-red-400">-${item.tax.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-red-400">-${item.deductions.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-emerald-400 font-black">${item.netSalary.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handlePreviewClick(item)}
                        className="px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-300 hover:text-white rounded-xl text-[10px] font-black transition-all"
                      >
                        👁️ View PDF
                      </button>
                      <button
                        onClick={() => downloadPayslip(item.id, `Payslip-${item.payroll?.month}-${item.payroll?.year}`)}
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[10px] font-black transition-all"
                      >
                        📥 Download
                      </button>
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-xs text-slateDark-600 italic">
                      No payslip records compiled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PDF viewer overlay */}
      <PayslipViewer
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        itemId={previewItem?.id}
        payslipNumber={`Payslip-${previewItem?.payroll?.month}-${previewItem?.payroll?.year}`}
      />
    </div>
  );
}
