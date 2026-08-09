import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';

const PromptSuggestions = ({ onSelectPrompt }) => {
  const prompts = [
    'How many active tasks are in the system?',
    'What projects are we tracking?',
    'What is the HR guidelines policy on leaves?',
    'Show active employees'
  ];

  return (
    <div className="space-y-3 select-none">
      <h4 className="text-xs font-bold text-zinc-400 flex items-center space-x-1.5 uppercase tracking-wider">
        <HelpCircle className="w-4 h-4 text-brand-400" />
        <span>Try asking prompt ideas:</span>
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(p)}
            className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 hover:border-zinc-800 rounded-xl text-left text-xs font-medium text-zinc-400 hover:text-white transition-all hover:bg-zinc-900/40"
          >
            <span>{p}</span>
            <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
