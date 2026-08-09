import React, { useEffect } from 'react';
import useAiStore from '../../store/aiStore';
import { MessageSquare, Trash2, PlusCircle } from 'lucide-react';

const ChatSidebar = ({ onSelectConversation, selectedId, onNewChat }) => {
  const conversations = useAiStore((state) => state.conversations);
  const fetchConversations = useAiStore((state) => state.fetchConversations);
  const deleteConversation = useAiStore((state) => state.deleteConversation);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="flex flex-col h-full bg-zinc-950/20 border border-zinc-900 rounded-2xl p-4 space-y-4">
      <button
        onClick={onNewChat}
        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-brand-600/10 hover:bg-brand-600/20 border border-brand-500/20 hover:border-brand-500/40 text-brand-400 rounded-xl text-xs font-bold transition-all"
      >
        <PlusCircle className="w-4 h-4" />
        <span>New Conversation Thread</span>
      </button>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-[480px] pr-1">
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectConversation(c.id)}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer group transition-all ${
              selectedId === c.id
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
                : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
            }`}
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold truncate select-none">{c.title}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(c.id);
              }}
              className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-6 text-xs text-zinc-500 italic select-none">
            No conversations logged yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
