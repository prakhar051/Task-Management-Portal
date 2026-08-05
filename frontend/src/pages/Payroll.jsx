import React, { useEffect, useState } from 'react';
import { usePayrollStore } from '../store/payrollStore';
import PayrollTable from '../components/payroll/PayrollTable';
import PayrollGenerator from '../components/payroll/PayrollGenerator';
import PayrollToolbar from '../components/payroll/PayrollToolbar';
import PaymentDialog from '../components/payroll/PaymentDialog';

export default function Payroll() {
  const payrolls = usePayrollStore((state) => state.payrolls);
  const loading = usePayrollStore((state) => state.loading);
  const error = usePayrollStore((state) => state.error);

  const fetchPayrolls = usePayrollStore((state) => state.fetchPayrolls);
  const generatePayroll = usePayrollStore((state) => state.generatePayroll);
  const approvePayroll = usePayrollStore((state) => state.approvePayroll);
  const payPayroll = usePayrollStore((state) => state.payPayroll);
  const cancelPayroll = usePayrollStore((state) => state.cancelPayroll);

  const [activeTab, setActiveTab] = useState('runs');
  const [payTarget, setPayTarget] = useState(null);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const handleGenerate = async (month, year) => {
    await generatePayroll(month, year);
  };

  const handlePayClick = (id) => {
    const pr = payrolls.find((p) => p.id === id);
    setPayTarget(pr);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Payroll</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Payroll Operations & Audits</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* Toolbar filters */}
      <PayrollToolbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'structures') {
            window.location.href = '/salary-structures';
          }
        }}
      />

      {/* Generator block */}
      <PayrollGenerator
        onGenerate={handleGenerate}
        loading={loading}
      />

      {loading && payrolls.length === 0 ? (
        <div className="py-24 text-center text-xs text-slateDark-500 italic">
          Compiling payroll directories...
        </div>
      ) : (
        <PayrollTable
          payrolls={payrolls}
          onApprove={approvePayroll}
          onPay={handlePayClick}
          onCancel={cancelPayroll}
        />
      )}

      {/* Disbursement confirmation overlay */}
      <PaymentDialog
        isOpen={!!payTarget}
        onClose={() => setPayTarget(null)}
        onConfirm={payPayroll}
        payroll={payTarget}
      />
    </div>
  );
}
