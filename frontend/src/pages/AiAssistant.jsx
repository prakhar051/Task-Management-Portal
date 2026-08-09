import React, { useState } from 'react';
import ChatSidebar from '../components/ai/ChatSidebar';
import AiChatWindow from '../components/ai/AiChatWindow';
import PromptSuggestions from '../components/ai/PromptSuggestions';
import RecommendationCard from '../components/ai/RecommendationCard';

const AiAssistant = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const handleSelectPrompt = (textPrompt) => {
    // Send event logic handled inside AiChatWindow via manual trigger
    const inputEl = document.querySelector('form input[type="text"]');
    if (inputEl) {
      inputEl.value = textPrompt;
      // Trigger native input updates
      const event = new Event('input', { bubbles: true });
      inputEl.dispatchEvent(event);
      inputEl.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Assistant & Copilot</h1>
        <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
          Chat with the assistant, ask business queries, or check operational workload insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Conversations Sidebar */}
        <div className="lg:col-span-1">
          <ChatSidebar
            selectedId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onNewChat={() => setSelectedConversationId(null)}
          />
        </div>

        {/* Central Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          <AiChatWindow
            conversationId={selectedConversationId}
            onConversationCreated={setSelectedConversationId}
          />
          <PromptSuggestions onSelectPrompt={handleSelectPrompt} />
        </div>

        {/* Workloads and suggestions widgets */}
        <div className="lg:col-span-1">
          <RecommendationCard />
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
