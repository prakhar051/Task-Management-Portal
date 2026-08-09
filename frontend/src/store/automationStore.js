import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const useAutomationStore = create((set, get) => ({
  rules: [],
  history: [],
  currentRule: null,
  loading: false,
  error: null,

  fetchRules: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.trigger) params.append('trigger', filters.trigger);

      const response = await apiClient.get(`/automation?${params.toString()}`);
      if (response.data.success) {
        set({ rules: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch automation rules.' });
    } finally {
      set({ loading: false });
    }
  },

  createRule: async (ruleData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/automation', ruleData);
      if (response.data.success) {
        get().fetchRules();
        return response.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create automation rule.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateRule: async (id, ruleData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/automation/${id}`, ruleData);
      if (response.data.success) {
        get().fetchRules();
        return response.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update automation rule.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteRule: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.delete(`/automation/${id}`);
      if (response.data.success) {
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id)
        }));
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete automation rule.' });
    } finally {
      set({ loading: false });
    }
  },

  runRule: async (id) => {
    try {
      const response = await apiClient.post(`/automation/run/${id}`);
      if (response.data.success) {
        get().fetchHistory();
        return true;
      }
    } catch (err) {
      console.error('Failed to trigger rule manually', err);
      throw err;
    }
  },

  fetchHistory: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.ruleId) params.append('ruleId', filters.ruleId);
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get(`/automation/history?${params.toString()}`);
      if (response.data.success) {
        set({ history: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch automation run history.' });
    } finally {
      set({ loading: false });
    }
  }
}));

export default useAutomationStore;
