import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const useFeatureFlagStore = create((set, get) => ({
  flags: [],
  loading: false,
  error: null,

  fetchFlags: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get('/admin/features');
      if (res.data.success) set({ flags: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to list feature flags.' });
    } finally {
      set({ loading: false });
    }
  },

  createFlag: async (flagData) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/admin/features', flagData);
      if (res.data.success) {
        get().fetchFlags();
        return res.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create feature flag.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateFlag: async (id, flagData) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch(`/admin/features/${id}`, flagData);
      if (res.data.success) {
        get().fetchFlags();
        return res.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to toggle feature flag.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteFlag: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.delete(`/admin/features/${id}`);
      if (res.data.success) {
        set((state) => ({
          flags: state.flags.filter((f) => f.id !== id)
        }));
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete feature flag.' });
    } finally {
      set({ loading: false });
    }
  }
}));

export default useFeatureFlagStore;
