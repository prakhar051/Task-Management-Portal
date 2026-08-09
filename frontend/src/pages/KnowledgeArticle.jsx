import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useKnowledgeStore from '../store/knowledgeStore';
import KnowledgeEditor from '../components/knowledge/KnowledgeEditor';
import { ArrowLeft, Edit, Trash2, Calendar, Eye, Bookmark, History } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const KnowledgeArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const currentArticle = useKnowledgeStore((state) => state.currentArticle);
  const fetchArticleById = useKnowledgeStore((state) => state.fetchArticleById);
  const deleteArticle = useKnowledgeStore((state) => state.deleteArticle);
  const toggleFavorite = useKnowledgeStore((state) => state.toggleFavorite);
  const favorites = useKnowledgeStore((state) => state.favorites);
  const user = useAuthStore((state) => state.user);

  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    fetchArticleById(id);
  }, [id, fetchArticleById]);

  const handleFavorite = async () => {
    if (!currentArticle) return;
    await toggleFavorite(currentArticle.id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await deleteArticle(id);
      navigate('/knowledge');
    }
  };

  if (!currentArticle) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center animate-pulse">
        <span className="text-zinc-500 text-xs italic">Loading article content...</span>
      </div>
    );
  }

  const isFav = favorites.some((f) => f.articleId === currentArticle.id);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Back button & Action toolbar */}
      <div className="flex justify-between items-center select-none border-b border-zinc-900 pb-4">
        <Link
          to="/knowledge"
          className="flex items-center space-x-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-xl border transition-all ${
              isFav
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
          {canEdit && (
            <>
              <button
                onClick={() => setEditorOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center space-x-1.5 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-xl text-xs font-bold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md">
            {currentArticle.category?.name}
          </span>
          <span className="flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{currentArticle.viewCount} views</span>
          </span>
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Last revised {new Date(currentArticle.updatedAt).toLocaleDateString()}</span>
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white leading-tight">{currentArticle.title}</h1>
        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
          Author: {currentArticle.author?.name} ({currentArticle.author?.email})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Article Body Content */}
        <div className="lg:col-span-3 bg-zinc-950/20 border border-zinc-900 rounded-2xl p-6 prose prose-invert max-w-none">
          <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-medium">
            {currentArticle.content}
          </div>
        </div>

        {/* Revision logs */}
        <div className="lg:col-span-1 space-y-4 select-none">
          <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5 border-b border-zinc-900 pb-2">
              <History className="w-4 h-4 text-brand-400" />
              <span>Version History</span>
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {currentArticle.versions?.map((ver) => (
                <div key={ver.id} className="text-[10px] leading-relaxed border-l-2 border-zinc-800 pl-3 py-0.5">
                  <div className="font-bold text-white">Version {ver.versionNumber}</div>
                  <div className="text-zinc-500">{new Date(ver.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <KnowledgeEditor
        article={currentArticle}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          fetchArticleById(id);
        }}
      />
    </div>
  );
};

export default KnowledgeArticle;
