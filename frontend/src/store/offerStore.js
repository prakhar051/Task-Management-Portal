import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useOfferStore = create((set, get) => ({
  offers: [],
  loading: false,
  error: null,

  fetchOffers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/offers');
      if (response.data.success) {
        set({ offers: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch offer letters.' });
    } finally {
      set({ loading: false });
    }
  },

  createOffer: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/offers', data);
      if (response.data.success) {
        await get().fetchOffers();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create offer letter.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateOffer: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/offers/${id}`, data);
      if (response.data.success) {
        await get().fetchOffers();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update offer letter.' });
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));
