import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Calendar, User } from 'lucide-react';
import useKnowledgeStore from '../../store/knowledgeStore';

const KnowledgeCard = ({ article, isFavorite = false }) => {
  const toggleFavorite = useKnowledgeStore((state) => state.toggleFavorite);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(article.id);
  };

  return (
    <Link
      to={`/knowledge/${article.id}`}
      className="block p-5 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl space-y-4 hover:bg-zinc-900/10 transition-all select-none group"
    >
      {/* Title & Favorite */}
      <div className="flex justify-between items-start gap-4">
        <h4 className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors leading-snug">
          {article.title}
        </h4>
        <button
          onClick={handleFavorite}
          className={`p-1.5 rounded-lg border transition-all ${
            isFavorite
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-zinc-900 border-zinc-900 text-zinc-500 hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* Snippet summary */}
      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
        {article.content.replace(/[#*`]/g, '')}
      </p>

      {/* Footer tags & info */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold border-t border-zinc-900/60 pt-3">
        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-900 text-zinc-400 rounded-md">
          {article.category?.name || 'Policy'}
        </span>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{article.viewCount} views</span>
          </span>
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default KnowledgeCard;
