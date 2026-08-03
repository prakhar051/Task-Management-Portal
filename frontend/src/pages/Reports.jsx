import React from 'react';
import ReportGenerator from '../components/analytics/ReportGenerator';

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Reports</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Report Exporter</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <ReportGenerator />
      </div>
    </div>
  );
}
