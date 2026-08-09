import React from 'react';
import { Folder, FolderOpen } from 'lucide-react';

const KnowledgeTree = ({ categories, selectedId, onSelectCategory }) => {
  return (
    <div className="bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4 space-y-4 select-none">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Categories Directory</h3>
      <div className="space-y-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
            selectedId === null
              ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/30'
          }`}
        >
          {selectedId === null ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          <span>All Guidelines</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/30'
              }`}
            >
              {isSelected ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
              <span className="truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default KnowledgeTree;
