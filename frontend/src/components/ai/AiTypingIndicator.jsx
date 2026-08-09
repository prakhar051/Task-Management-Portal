import React from 'react';
import { Bot } from 'lucide-react';

const AiTypingIndicator = () => {
  return (
    <div className="flex items-start space-x-3 max-w-[85%]">
      <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-900 text-zinc-400 rounded-tl-none flex items-center space-x-2">
        <span className="text-xs italic select-none">AI is analyzing portal data...</span>
        <span className="flex space-x-1">
          <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
};

export default AiTypingIndicator;
