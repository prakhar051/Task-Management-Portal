import React, { useState, useEffect } from 'react';
import useKnowledgeStore from '../store/knowledgeStore';
import KnowledgeSearch from '../components/knowledge/KnowledgeSearch';
import KnowledgeTree from '../components/knowledge/KnowledgeTree';
import KnowledgeCard from '../components/knowledge/KnowledgeCard';
import KnowledgeEditor from '../components/knowledge/KnowledgeEditor';
import { BookOpen, Star, Plus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const KnowledgeBase = () => {
  const categories = useKnowledgeStore((state) => state.categories);
  const articles = useKnowledgeStore((state) => state.articles);
  const favorites = useKnowledgeStore((state) => state.favorites);
  const fetchCategories = useKnowledgeStore((state) => state.fetchCategories);
  const fetchArticles = useKnowledgeStore((state) => state.fetchArticles);
  const fetchFavorites = useKnowledgeStore((state) => state.fetchFavorites);
  const user = useAuthStore((state) => state.user);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'favorites'

  useEffect(() => {
    fetchCategories();
    fetchFavorites();
  }, [fetchCategories, fetchFavorites]);

  useEffect(() => {
    fetchArticles({ categoryId: selectedCategory, search: searchQuery });
  }, [selectedCategory, searchQuery, fetchArticles]);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Company Knowledge Base</h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Access company guidelines, policies, operational documents, and workflows.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setEditorOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Article</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-zinc-900 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>All Guidelines</span>
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'favorites'
              ? 'bg-zinc-900 text-white border border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500" />
          <span>Bookmarks</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Directory Tree */}
        <div className="lg:col-span-1">
          <KnowledgeTree
            categories={categories}
            selectedId={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Articles list grid */}
        <div className="lg:col-span-3 space-y-6">
          <KnowledgeSearch onSearch={setSearchQuery} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'all' ? (
              articles.map((art) => {
                const isFav = favorites.some((f) => f.articleId === art.id);
                return <KnowledgeCard key={art.id} article={art} isFavorite={isFav} />;
              })
            ) : (
              favorites.map((fav) => (
                <KnowledgeCard key={fav.article.id} article={fav.article} isFavorite={true} />
              ))
            )}

            {((activeTab === 'all' && articles.length === 0) ||
              (activeTab === 'favorites' && favorites.length === 0)) && (
              <div className="col-span-2 text-center py-12 border border-dashed border-zinc-900 rounded-2xl text-zinc-500 text-xs italic">
                No matching articles resolved in directory
              </div>
            )}
          </div>
        </div>
      </div>

      <KnowledgeEditor isOpen={editorOpen} onClose={() => setEditorOpen(false)} />
    </div>
  );
};

export default KnowledgeBase;
