import React, { useState } from 'react';
import { useReportStore } from '../../store/reportStore';
import ExportDialog from './ExportDialog';

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('tasks');
  const [isExportOpen, setIsExportOpen] = useState(false);

  const exportReport = useReportStore((state) => state.exportReport);
  const isLoading = useReportStore((state) => state.isLoading);
  const error = useReportStore((state) => state.error);

  const handleExport = async (format) => {
    try {
      await exportReport(reportType, format);
      setIsExportOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const reports = [
    { value: 'tasks', label: '📋 Task Detailed Report', desc: 'Renders complete list of task records, codes, parent mappings, priorities, status flows, and assignees lists.' },
    { value: 'projects', label: '📂 Project Statistics Report', desc: 'Renders project roster summaries, department associations, budgets, and overall progress indicators.' },
    { value: 'employees', label: '👥 Employee Registry Report', desc: 'Renders complete directory details, hire dates, designations, phone numbers, and status fields.' },
    { value: 'departments', label: '🏢 Department Roster Report', desc: 'Renders department distribution listings, managers, and employee count breakdowns.' },
    { value: 'productivity', label: '⚡ Productivity Metrics Report', desc: 'Renders complete lists of completed tasks, projects department categories, and timeline metrics.' }
  ];

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-6 space-y-6 select-none shadow-lg">
      <div className="border-b border-slateDark-900 pb-3">
        <h3 className="text-base font-extrabold text-white">Generate Custom Reports</h3>
        <p className="text-slateDark-500 text-xs mt-0.5">Select a business query, apply filters from the toolbar, and trigger download exports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r) => (
          <div
            key={r.value}
            onClick={() => setReportType(r.value)}
            className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col space-y-1.5 ${
              reportType === r.value
                ? 'bg-brand-500/10 border-brand-500/30'
                : 'bg-slateDark-900/10 border-slateDark-900 hover:border-slateDark-800'
            }`}
          >
            <h4 className="text-xs font-bold text-white leading-none">{r.label}</h4>
            <p className="text-[10px] text-slateDark-400 leading-normal">{r.desc}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <div className="flex justify-end pt-3">
        <button
          onClick={() => setIsExportOpen(true)}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center space-x-1.5"
        >
          <span>📥</span>
          <span>Generate and Export Report</span>
        </button>
      </div>

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
        isLoading={isLoading}
      />
    </div>
  );
}
