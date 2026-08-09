import React, { useState, useEffect } from 'react';
import useKnowledgeStore from '../../store/knowledgeStore';
import { X, Check } from 'lucide-react';

const KnowledgeEditor = ({ article = null, isOpen, onClose }) => {
  const categories = useKnowledgeStore((state) => state.categories);
  const createArticle = useKnowledgeStore((state) => state.createArticle);
  const updateArticle = useKnowledgeStore((state) => state.updateArticle);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('DRAFT');

  useEffect(() => {
    if (article) {
      setTitle(article.title || '');
      setContent(article.content || '');
      setCategoryId(article.categoryId || '');
      setStatus(article.status || 'DRAFT');
    } else {
      setTitle('');
      setContent('');
      setCategoryId(categories[0]?.id || '');
      setStatus('DRAFT');
    }
  }, [article, categories, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !categoryId) return;

    const data = { title, content, categoryId, status };

    try {
      if (article) {
        await updateArticle(article.id, data);
      } else {
        await createArticle(data);
      }
      onClose();
    } catch (err) {
      alert('Failed to save knowledge base article.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-zinc-900 bg-zinc-950/40">
          <h3 className="text-sm font-bold text-white">
            {article ? '✏️ Edit Article Specifications' : '📝 Compose Guideline Document'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Leave Policies & Carry-Over Guidelines"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="" disabled>Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Publish Status</label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Markdown Content</label>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Compose your article details here. Supports standard Markdown syntax..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Guideline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeEditor;
