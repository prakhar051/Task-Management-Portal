import React from 'react';

export default function DocumentToolbar({
  searchVal,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onUploadClick,
  pagination,
  onPageChange
}) {
  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between select-none">
      {/* Search Input & View Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full md:w-auto">
        <div className="relative flex-1 sm:w-64">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slateDark-500 text-xs">🔍</span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full pl-9 pr-4 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none"
          />
        </div>

        <div className="flex border border-slateDark-850 rounded-xl overflow-hidden self-start sm:self-auto">
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'table' ? 'bg-slateDark-900 text-white' : 'bg-transparent text-slateDark-500 hover:text-slateDark-300'
            }`}
          >
            📊 Table
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              viewMode === 'grid' ? 'bg-slateDark-900 text-white' : 'bg-transparent text-slateDark-500 hover:text-slateDark-300'
            }`}
          >
            🔲 Grid
          </button>
        </div>
      </div>

      {/* Pages and Action controls */}
      <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center space-x-2.5 text-xs font-semibold text-slateDark-400 font-mono">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-2 py-1.5 bg-slateDark-900 border border-slateDark-850 rounded-lg hover:text-white disabled:opacity-30 disabled:hover:text-slateDark-400 transition-all"
            >
              ◀
            </button>
            <span>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-2 py-1.5 bg-slateDark-900 border border-slateDark-850 rounded-lg hover:text-white disabled:opacity-30 disabled:hover:text-slateDark-400 transition-all"
            >
              ▶
            </button>
          </div>
        )}

        <button
          onClick={onUploadClick}
          className="px-4.5 py-2.5 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-brand-500/10"
        >
          ➕ Upload Document
        </button>
      </div>
    </div>
  );
}
