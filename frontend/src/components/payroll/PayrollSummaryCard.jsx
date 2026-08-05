import React from 'react';

export default function PayrollSummaryCard({ payroll }) {
  if (!payroll || !payroll.items) return null;

  const totalBasic = payroll.items.reduce((sum, item) => sum + item.basicSalary, 0);
  const totalAllowances = payroll.items.reduce((sum, item) => sum + item.allowances, 0);
  const totalBonuses = payroll.items.reduce((sum, item) => sum + item.bonuses, 0);
  const totalDeductions = payroll.items.reduce((sum, item) => sum + item.deductions, 0);
  const totalOvertime = payroll.items.reduce((sum, item) => sum + item.overtimePay, 0);
  const totalTax = payroll.items.reduce((sum, item) => sum + item.tax, 0);
  const totalNet = payroll.items.reduce((sum, item) => sum + item.netSalary, 0);

  const cards = [
    { title: 'Total Net Disbursed', value: `$${totalNet.toLocaleString()}`, color: 'text-emerald-400', icon: '💰' },
    { title: 'Gross Pay Total', value: `$${(totalBasic + totalAllowances + totalBonuses + totalOvertime).toLocaleString()}`, color: 'text-brand-400', icon: '⏱️' },
    { title: 'Tax Withholdings', value: `$${totalTax.toLocaleString()}`, color: 'text-red-400', icon: '📉' },
    { title: 'Overtime Paid', value: `$${totalOvertime.toLocaleString()}`, color: 'text-amber-400', icon: '📈' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {cards.map((c, idx) => (
        <div key={idx} className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-5 flex items-center space-x-4 shadow-md">
          <span className="text-2xl">{c.icon}</span>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slateDark-500 uppercase tracking-wider block">{c.title}</span>
            <span className="text-lg font-black text-white block leading-none">{c.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
