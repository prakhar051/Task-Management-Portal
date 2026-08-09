import React, { useEffect } from 'react';
import useAiStore from '../../store/aiStore';
import { AlertTriangle, TrendingUp, UserCheck, RefreshCw } from 'lucide-react';

const RecommendationCard = () => {
  const suggestions = useAiStore((state) => state.suggestions);
  const loading = useAiStore((state) => state.loading);
  const fetchRecommendations = useAiStore((state) => state.fetchRecommendations);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const getIcon = (type) => {
    switch (type) {
      case 'WORKLOAD':
        return <UserCheck className="w-4 h-4 text-brand-400" />;
      case 'RISK':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'WORKLOAD':
        return 'bg-brand-500/5 border-brand-500/20 text-brand-400';
      case 'RISK':
        return 'bg-rose-500/5 border-rose-500/20 text-rose-400';
      default:
        return 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400';
    }
  };

  return (
    <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4 select-none">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Operations Insights</h4>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3">
        {suggestions.map((rec, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 p-3.5 border rounded-xl bg-zinc-950/65 ${
              rec.type === 'RISK' ? 'border-rose-950/60' : 'border-zinc-900'
            }`}
          >
            <div className={`p-2 rounded-lg border shrink-0 ${getColors(rec.type)}`}>
              {getIcon(rec.type)}
            </div>
            <div className="space-y-1">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{rec.type} suggestion</h5>
              <p className="text-xs text-zinc-300 leading-relaxed">{rec.content}</p>
            </div>
          </div>
        ))}

        {suggestions.length === 0 && !loading && (
          <div className="text-center py-6 text-xs text-zinc-500 italic">
            No active operational warnings detected
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;
