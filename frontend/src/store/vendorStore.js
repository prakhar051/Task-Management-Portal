import { create } from 'zustand';
import apiClient from '../api/apiClient';

const useVendorStore = create((set, get) => ({
  vendors: [],
  loading: false,
  error: null,

  fetchVendors: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get('/vendors');
      set({ vendors: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch vendors.', loading: false });
    }
  },

  createVendor: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/vendors', data);
      set((state) => ({
        vendors: [...state.vendors, res.data.data],
        loading: false
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create vendor.', loading: false });
      throw err;
    }
  },

  updateVendor: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch(`/vendors/${id}`, data);
      set((state) => ({
        vendors: state.vendors.map((v) => (v.id === id ? res.data.data : v)),
        loading: false
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update vendor.', loading: false });
      throw err;
    }
  },

  deleteVendor: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/vendors/${id}`);
      set((state) => ({
        vendors: state.vendors.filter((v) => v.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete vendor.', loading: false });
      throw err;
    }
  }
}));

export default useVendorStore;
