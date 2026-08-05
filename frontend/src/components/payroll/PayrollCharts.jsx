import React from 'react';

export default function PayrollCharts({ payroll }) {
  if (!payroll || !payroll.items || payroll.items.length === 0) return null;

  const totalBasic = payroll.items.reduce((sum, item) => sum + item.basicSalary, 0);
  const totalAllowances = payroll.items.reduce((sum, item) => sum + item.allowances, 0);
  const totalBonuses = payroll.items.reduce((sum, item) => sum + item.bonuses, 0);
  const totalOvertime = payroll.items.reduce((sum, item) => sum + item.overtimePay, 0);
  const totalTax = payroll.items.reduce((sum, item) => sum + item.tax, 0);
  const totalDeductions = payroll.items.reduce((sum, item) => sum + item.deductions, 0);

  const sumTotal = totalBasic + totalAllowances + totalBonuses + totalOvertime + totalTax + totalDeductions || 1;

  const shares = [
    { label: 'Basic', val: totalBasic, color: '#6366f1' },
    { label: 'Allowances', val: totalAllowances, color: '#10b981' },
    { label: 'Bonuses', val: totalBonuses, color: '#f59e0b' },
    { label: 'Overtime', val: totalOvertime, color: '#3b82f6' },
    { label: 'Taxes', val: totalTax, color: '#ef4444' },
    { label: 'Deductions', val: totalDeductions, color: '#a855f7' }
  ].filter((s) => s.val > 0);

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 shadow-lg select-none space-y-4">
      <h4 className="text-xs font-black uppercase text-slateDark-400 tracking-wider border-b border-slateDark-900 pb-2">
        📊 Monthly Salary Distribution
      </h4>

      <div className="flex flex-col md:flex-row items-center gap-6 justify-around">
        {/* Simple inline SVG horizontal stack bar */}
        <div className="w-full max-w-md space-y-3.5">
          <div className="h-6 w-full rounded-full overflow-hidden flex bg-slateDark-900 border border-slateDark-800">
            {shares.map((s, idx) => {
              const pct = (s.val / sumTotal) * 100;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%`, backgroundColor: s.color }}
                  title={`${s.label}: $${s.val.toLocaleString()} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] font-bold text-slateDark-400">
            {shares.map((s, idx) => {
              const pct = (s.val / sumTotal) * 100;
              return (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full block" style={{ backgroundColor: s.color }}></span>
                  <span>
                    {s.label} ({pct.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
