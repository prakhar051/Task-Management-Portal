import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const useBackupStore = create((set, get) => ({
  backups: [],
  loading: false,
  error: null,

  fetchBackups: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get('/admin/backups');
      if (res.data.success) set({ backups: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to list backups.' });
    } finally {
      set({ loading: false });
    }
  },

  createBackup: async (scope = 'ALL') => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/admin/backups', { scope });
      if (res.data.success) {
        get().fetchBackups();
        return res.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to initiate backup.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  restoreBackup: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post(`/admin/backups/${id}/restore`);
      return res.data.success;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to restore backup archive.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  }
}));

export default useBackupStore;
