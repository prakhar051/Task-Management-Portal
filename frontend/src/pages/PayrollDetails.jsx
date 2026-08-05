import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePayrollStore } from '../store/payrollStore';
import PayrollSummaryCard from '../components/payroll/PayrollSummaryCard';
import PayrollCharts from '../components/payroll/PayrollCharts';
import PayslipViewer from '../components/payroll/PayslipViewer';

export default function PayrollDetails() {
  const { id } = useParams();

  const activePayroll = usePayrollStore((state) => state.activePayroll);
  const loading = usePayrollStore((state) => state.loading);
  const error = usePayrollStore((state) => state.error);

  const fetchPayrollDetails = usePayrollStore((state) => state.fetchPayrollDetails);
  const downloadPayslip = usePayrollStore((state) => state.downloadPayslip);

  const [previewItem, setPreviewItem] = useState(null);

  useEffect(() => {
    fetchPayrollDetails(id);
  }, [fetchPayrollDetails, id]);

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

  if (loading && !activePayroll) {
    return (
      <div className="py-24 text-center text-xs text-slateDark-500 italic">
        Compiling payroll details...
      </div>
    );
  }

  if (!activePayroll) {
    return (
      <div className="py-24 text-center text-xs text-slateDark-600 italic">
        Payroll statement record could not be resolved. <Link to="/payroll" className="text-brand-400 font-bold underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <Link to="/payroll" className="hover:text-white">Payroll runs</Link>
            <span>/</span>
            <span className="text-white font-mono">{getMonthName(activePayroll.month)} {activePayroll.year}</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">
            Payroll Statements Run: {getMonthName(activePayroll.month)} {activePayroll.year}
          </h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards summary */}
      <PayrollSummaryCard payroll={activePayroll} />

      {/* Visual Chart distribution */}
      <PayrollCharts payroll={activePayroll} />

      {/* Employee payroll items table grid */}
      <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
              <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
                <th className="py-4 px-5">Employee</th>
                <th className="py-4 px-5">Base Pay</th>
                <th className="py-4 px-5">Allowances</th>
                <th className="py-4 px-5">Bonuses</th>
                <th className="py-4 px-5">Overtime Pay</th>
                <th className="py-4 px-5">Tax Deductions</th>
                <th className="py-4 px-5">Other Deductions</th>
                <th className="py-4 px-5">Net Pay Salary</th>
                <th className="py-4 px-5 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
              {activePayroll.items?.map((item) => (
                <tr key={item.id} className="hover:bg-slateDark-900/10 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-white">
                    {item.employee?.firstName} {item.employee?.lastName}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slateDark-300">${item.basicSalary.toLocaleString()}</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-400">+${item.allowances.toLocaleString()}</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-400">+${item.bonuses.toLocaleString()}</td>
                  <td className="py-3.5 px-5 font-mono text-amber-400">+${item.overtimePay.toLocaleString()}</td>
                  <td className="py-3.5 px-5 font-mono text-red-400">-${item.tax.toLocaleString()}</td>
                  <td className="py-3.5 px-5 font-mono text-red-400">-${item.deductions.toLocaleString()}</td>
                  <td className="py-3.5 px-5 font-mono text-white font-black">${item.netSalary.toLocaleString()}</td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    {activePayroll.status !== 'DRAFT' && (
                      <>
                        <button
                          onClick={() => handlePreviewClick(item)}
                          className="px-2.5 py-1 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-[10px] font-bold transition-all"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => downloadPayslip(item.id, item.payslips?.[0]?.payslipNumber)}
                          className="px-2.5 py-1 bg-brand-500/10 hover:bg-brand-500 border border-brand-500/20 text-brand-400 hover:text-white rounded-xl text-[10px] font-bold transition-all"
                        >
                          📥 Download
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF viewer Overlay */}
      <PayslipViewer
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        itemId={previewItem?.id}
        payslipNumber={previewItem?.payslips?.[0]?.payslipNumber}
      />
    </div>
  );
}
