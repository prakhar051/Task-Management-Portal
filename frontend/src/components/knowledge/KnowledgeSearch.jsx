import React, { useState } from 'react';
import { Search } from 'lucide-react';

const KnowledgeSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full select-none">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4.5 w-4.5 text-zinc-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value); // Trigger query instantly on input shifts
        }}
        placeholder="Search article titles, keywords, guidelines policies..."
        className="block w-full pl-10 pr-4 py-3 bg-zinc-950/65 border border-zinc-900 focus:border-brand-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
      />
    </form>
  );
};

export default KnowledgeSearch;
