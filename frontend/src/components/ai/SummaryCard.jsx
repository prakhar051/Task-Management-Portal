import React, { useState } from 'react';
import useAiStore from '../../store/aiStore';
import { Sparkles, RefreshCw, FileText } from 'lucide-react';

const SummaryCard = ({ type, id }) => {
  const summaries = useAiStore((state) => state.summaries);
  const generateSummary = useAiStore((state) => state.generateSummary);
  const [loading, setLoading] = useState(false);

  const key = `${type}_${id}`;
  const currentSummary = summaries[key];

  const handleSummarize = async () => {
    setLoading(true);
    try {
      await generateSummary(type, id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4 select-none">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-zinc-400 flex items-center space-x-1.5 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-brand-400" />
          <span>AI Context Summary</span>
        </h4>
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="flex items-center space-x-1 px-3 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white rounded-lg transition-colors"
        >
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 text-brand-400" />
          )}
          <span>{currentSummary ? 'Recalculate' : 'Generate Summary'}</span>
        </button>
      </div>

      {currentSummary ? (
        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 border border-zinc-900 rounded-xl whitespace-pre-line">
          {currentSummary}
        </p>
      ) : (
        <div className="text-center py-6 border border-dashed border-zinc-900 rounded-xl text-zinc-500 text-xs italic">
          No summary computed. Click "Generate Summary" to run calculations.
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
