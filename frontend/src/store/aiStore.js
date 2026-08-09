import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const useAiStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  suggestions: [],
  summaries: {}, // entityType_entityId -> string summary
  loading: false,
  error: null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/ai/conversations');
      if (response.data.success) {
        set({ conversations: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch chat logs.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchConversationMessages: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/ai/conversations/${id}`);
      if (response.data.success) {
        set({
          activeConversation: response.data.data,
          messages: response.data.data?.messages || []
        });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch thread messages.' });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (messageText, conversationId = null) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/ai/chat', {
        conversationId,
        message: messageText
      });
      if (response.data.success) {
        const { conversationId: nextId, message } = response.data.data;
        
        // Append prompt and response messages manually to maintain state
        const promptMsg = { id: `prompt-${Date.now()}`, role: 'USER', content: messageText };
        
        set((state) => ({
          messages: [...state.messages, promptMsg, message]
        }));
        
        if (!conversationId) {
          get().fetchConversations();
        }
        return nextId;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to send message.' });
    } finally {
      set({ loading: false });
    }
  },

  deleteConversation: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.delete(`/ai/conversations/${id}`);
      if (response.data.success) {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversation: state.activeConversation?.id === id ? null : state.activeConversation,
          messages: state.activeConversation?.id === id ? [] : state.messages
        }));
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete chat.' });
    } finally {
      set({ loading: false });
    }
  },

  generateSummary: async (type, id) => {
    const key = `${type}_${id}`;
    try {
      const response = await apiClient.post('/ai/summarize', { type, id });
      if (response.data.success) {
        set((state) => ({
          summaries: { ...state.summaries, [key]: response.data.data }
        }));
        return response.data.data;
      }
    } catch (err) {
      console.error('Summary generation failed', err);
    }
  },

  fetchRecommendations: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/ai/recommend');
      if (response.data.success) {
        set({ suggestions: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch recommendations.' });
    } finally {
      set({ loading: false });
    }
  }
}));

export default useAiStore;
