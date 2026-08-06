import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useJobStore = create((set, get) => ({
  jobs: [],
  activeJob: null,
  stages: [],
  loading: false,
  error: null,

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/jobs');
      if (response.data.success) {
        set({ jobs: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch job openings.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchJobDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/jobs/${id}`);
      if (response.data.success) {
        set({ activeJob: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch details.' });
    } finally {
      set({ loading: false });
    }
  },

  createJob: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/jobs', data);
      if (response.data.success) {
        await get().fetchJobs();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create job Opening.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateJob: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/jobs/${id}`, data);
      if (response.data.success) {
        await get().fetchJobs();
        if (get().activeJob?.id === id) {
          await get().fetchJobDetails(id);
        }
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update opening.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteJob: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.delete(`/jobs/${id}`);
      if (response.data.success) {
        await get().fetchJobs();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete opening.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchStages: async () => {
    try {
      const response = await apiClient.get('/jobs/stages');
      if (response.data.success) {
        set({ stages: response.data.data });
      }
    } catch (err) {
      console.error('Failed to load hiring stages:', err);
    }
  }
}));
