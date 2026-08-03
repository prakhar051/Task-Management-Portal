import React from 'react';
import { useTaskStore } from '../../store/taskStore';

export default function TaskPagination() {
  const pagination = useTaskStore((state) => state.pagination);
  const setPage = useTaskStore((state) => state.setPage);

  const { page, total, pages } = pagination;

  if (pages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slateDark-900 select-none">
      <div className="text-xs font-bold text-slateDark-400">
        Showing page <span className="text-white">{page}</span> of <span className="text-white">{pages}</span> ({total} tasks)
      </div>

      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-3 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 disabled:hover:border-slateDark-800 disabled:cursor-not-allowed transition-all"
        >
          ◀ Previous
        </button>

        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
          // Show first, last, and pages around current page
          if (p === 1 || p === pages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border ${
                  p === page
                    ? 'bg-brand-600 border-brand-500 text-white shadow-lg'
                    : 'bg-slateDark-900 border-slateDark-800 hover:border-slateDark-700 text-slateDark-300'
                }`}
              >
                {p}
              </button>
            );
          }
          if (p === 2 || p === pages - 1) {
            return (
              <span key={p} className="text-slateDark-500 px-1 text-xs">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => setPage(Math.min(pages, page + 1))}
          disabled={page === pages}
          className="px-3 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-700 text-white rounded-lg text-xs font-bold disabled:opacity-40 disabled:hover:border-slateDark-800 disabled:cursor-not-allowed transition-all"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}
