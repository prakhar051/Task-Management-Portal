import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useInterviewStore = create((set, get) => ({
  interviews: [],
  activeInterview: null,
  loading: false,
  error: null,

  fetchInterviews: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/interviews');
      if (response.data.success) {
        set({ interviews: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch interviews schedule.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchInterviewDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/interviews/${id}`);
      if (response.data.success) {
        set({ activeInterview: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch interview details.' });
    } finally {
      set({ loading: false });
    }
  },

  scheduleInterview: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/interviews', data);
      if (response.data.success) {
        await get().fetchInterviews();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to schedule interview round.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateInterview: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/interviews/${id}`, data);
      if (response.data.success) {
        await get().fetchInterviews();
        if (get().activeInterview?.id === id) {
          await get().fetchInterviewDetails(id);
        }
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update interview session.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  cancelInterview: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.delete(`/interviews/${id}`);
      if (response.data.success) {
        await get().fetchInterviews();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to cancel interview.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  submitFeedback: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post(`/interviews/${id}/feedback`, payload);
      if (response.data.success) {
        if (get().activeInterview?.id === id) {
          await get().fetchInterviewDetails(id);
        }
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to submit feedback scorecard.' });
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));
