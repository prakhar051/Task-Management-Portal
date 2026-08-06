import { create } from 'zustand';
import apiClient from '../api/apiClient';

const useMaintenanceStore = create((set, get) => ({
  records: [],
  loading: false,
  error: null,

  fetchRecords: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get('/maintenance');
      set({ records: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch maintenance logs.', loading: false });
    }
  },

  createRecord: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/maintenance', data);
      set((state) => ({
        records: [...state.records, res.data.data],
        loading: false
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create log.', loading: false });
      throw err;
    }
  },

  updateRecord: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch(`/maintenance/${id}`, data);
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? res.data.data : r)),
        loading: false
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update maintenance details.', loading: false });
      throw err;
    }
  },

  deleteRecord: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/maintenance/${id}`);
      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete record.', loading: false });
      throw err;
    }
  }
}));

export default useMaintenanceStore;
