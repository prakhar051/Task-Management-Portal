import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useCandidateStore = create((set, get) => ({
  candidates: [],
  activeCandidate: null,
  loading: false,
  error: null,

  fetchCandidates: async (jobOpeningId = null) => {
    set({ loading: true, error: null });
    try {
      const url = jobOpeningId ? `/candidates?jobOpeningId=${jobOpeningId}` : '/candidates';
      const response = await apiClient.get(url);
      if (response.data.success) {
        set({ candidates: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch applicants.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchCandidateDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/candidates/${id}`);
      if (response.data.success) {
        set({ activeCandidate: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch details.' });
    } finally {
      set({ loading: false });
    }
  },

  createCandidate: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/candidates', data);
      if (response.data.success) {
        await get().fetchCandidates();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to register candidate.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateCandidate: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/candidates/${id}`, data);
      if (response.data.success) {
        await get().fetchCandidates();
        if (get().activeCandidate?.id === id) {
          await get().fetchCandidateDetails(id);
        }
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update candidate.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  changeStage: async (id, stage) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/candidates/${id}/stage`, { stage });
      if (response.data.success) {
        await get().fetchCandidates();
        if (get().activeCandidate?.id === id) {
          await get().fetchCandidateDetails(id);
        }
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to change stage.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  hireCandidate: async (id, employeeCode) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post(`/candidates/${id}/hire`, { employeeCode });
      if (response.data.success) {
        await get().fetchCandidates();
        if (get().activeCandidate?.id === id) {
          await get().fetchCandidateDetails(id);
        }
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Hiring transaction failed.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  linkDocument: async (id, documentId, type) => {
    try {
      const response = await apiClient.post(`/candidates/${id}/document`, { documentId, type });
      if (response.data.success) {
        if (get().activeCandidate?.id === id) {
          await get().fetchCandidateDetails(id);
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to link document:', err);
      return false;
    }
  }
}));
