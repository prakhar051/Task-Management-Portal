import { create } from 'zustand';
import apiClient from '../api/apiClient';

const useAssetStore = create((set, get) => ({
  assets: [],
  selectedAsset: null,
  loading: false,
  error: null,

  fetchAssets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get('/assets');
      set({ assets: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch assets.', loading: false });
    }
  },

  fetchAssetById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get(`/assets/${id}`);
      set({ selectedAsset: res.data.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch asset details.', loading: false });
    }
  },

  createAsset: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/assets', data);
      set((state) => ({
        assets: [...state.assets, res.data.data],
        loading: false
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create asset.', loading: false });
      throw err;
    }
  },

  updateAsset: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch(`/assets/${id}`, data);
      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? res.data.data : a)),
        selectedAsset: state.selectedAsset?.id === id ? res.data.data : state.selectedAsset,
        loading: false
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update asset.', loading: false });
      throw err;
    }
  },

  deleteAsset: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/assets/${id}`);
      set((state) => ({
        assets: state.assets.filter((a) => a.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete asset.', loading: false });
      throw err;
    }
  },

  assignAsset: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/assets/assign', data);
      set({ loading: false });
      await get().fetchAssets();
      if (get().selectedAsset?.id === data.assetId) {
        await get().fetchAssetById(data.assetId);
      }
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to assign asset.', loading: false });
      throw err;
    }
  },

  returnAsset: async (assignmentId, data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch(`/assets/return/${assignmentId}`, data);
      set({ loading: false });
      await get().fetchAssets();
      if (get().selectedAsset) {
        await get().fetchAssetById(get().selectedAsset.id);
      }
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to register return.', loading: false });
      throw err;
    }
  },

  transferAsset: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/assets/transfer', data);
      set({ loading: false });
      await get().fetchAssets();
      if (get().selectedAsset?.id === data.assetId) {
        await get().fetchAssetById(data.assetId);
      }
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to transfer asset.', loading: false });
      throw err;
    }
  },

  calculateDepreciation: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post('/assets/depreciation', data);
      set({ loading: false });
      if (get().selectedAsset?.id === data.assetId) {
        await get().fetchAssetById(data.assetId);
      }
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to calculate depreciation.', loading: false });
      throw err;
    }
  }
}));

export default useAssetStore;
