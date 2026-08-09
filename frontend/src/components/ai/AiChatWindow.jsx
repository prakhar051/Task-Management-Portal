import React, { useState, useEffect, useRef } from 'react';
import useAiStore from '../../store/aiStore';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import AiTypingIndicator from './AiTypingIndicator';

const AiChatWindow = ({ conversationId, onConversationCreated }) => {
  const messages = useAiStore((state) => state.messages);
  const loading = useAiStore((state) => state.loading);
  const sendMessage = useAiStore((state) => state.sendMessage);
  const fetchConversationMessages = useAiStore((state) => state.fetchConversationMessages);

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversationMessages(conversationId);
    }
  }, [conversationId, fetchConversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input;
    setInput('');
    const nextId = await sendMessage(text, conversationId);
    if (!conversationId && nextId && onConversationCreated) {
      onConversationCreated(nextId);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-zinc-950/30 border border-zinc-900 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-zinc-900 bg-zinc-950/40">
        <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>TaskPortal AI Assistant</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
          </h3>
          <p className="text-[10px] text-zinc-400 font-medium">Enterprise Assistant & Query Copilot</p>
        </div>
      </div>

      {/* Messages Logs list */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'USER';
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-3 max-w-[85%] ${
                isUser ? 'ml-auto flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-xl border shrink-0 ${
                isUser 
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                  : 'bg-brand-500/10 border-brand-500/20 text-brand-400'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isUser
                  ? 'bg-brand-600 text-white font-medium rounded-tr-none'
                  : 'bg-zinc-900/60 border border-zinc-900 text-zinc-200 rounded-tl-none whitespace-pre-line'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}

        {loading && <AiTypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-900 bg-zinc-950/40 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about active tasks, departments, or workflow guidelines..."
          className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-3 bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-800 text-white rounded-xl transition-all shadow-lg flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AiChatWindow;
