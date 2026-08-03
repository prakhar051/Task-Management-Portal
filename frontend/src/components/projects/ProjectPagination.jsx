import React from 'react';
import { useProjectStore } from '../../store/projectStore';

export default function ProjectPagination() {
  const { pagination, setPagination } = useProjectStore();
  const { page, limit, total, pages } = pagination;

  const handlePrev = () => {
    if (page > 1) {
      setPagination(page - 1);
    }
  };

  const handleNext = () => {
    if (page < pages) {
      setPagination(page + 1);
    }
  };

  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, total);

  if (pages <= 1 && total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4 select-none">
      <div className="text-xs text-slateDark-400 font-semibold">
        Showing <span className="text-white font-bold">{startIdx}</span> to{' '}
        <span className="text-white font-bold">{endIdx}</span> of{' '}
        <span className="text-white font-bold">{total}</span> projects
      </div>

      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3.5 py-1.5 rounded-lg border border-slateDark-800 text-slateDark-300 font-semibold hover:bg-slateDark-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <span className="text-xs text-slateDark-400 font-bold px-3">
          Page <span className="text-white font-extrabold">{page}</span> of {pages}
        </span>

        <button
          onClick={handleNext}
          disabled={page === pages || pages === 0}
          className="px-3.5 py-1.5 rounded-lg border border-slateDark-800 text-slateDark-300 font-semibold hover:bg-slateDark-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
