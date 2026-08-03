import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useLeaveStore = create((set, get) => ({
  leaves: [],
  isLoading: false,
  error: null,

  fetchLeaves: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/leaves', { params });
      if (response.data.success) {
        set({ leaves: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch leave requests.' });
    } finally {
      set({ isLoading: false });
    }
  },

  submitLeaveRequest: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/leaves', data);
      if (response.data.success) {
        set((state) => ({ leaves: [response.data.data, ...state.leaves] }));
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to submit leave request.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  approveLeaveRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/leaves/${id}/approve`);
      if (response.data.success) {
        set((state) => ({
          leaves: state.leaves.map((l) => (l.id === id ? response.data.data : l))
        }));
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to approve leave request.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  rejectLeaveRequest: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/leaves/${id}/reject`, { rejectionReason: reason });
      if (response.data.success) {
        set((state) => ({
          leaves: state.leaves.map((l) => (l.id === id ? response.data.data : l))
        }));
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to reject leave request.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelLeaveRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/leaves/${id}`);
      if (response.data.success) {
        set((state) => ({
          leaves: state.leaves.map((l) => (l.id === id ? response.data.data : l))
        }));
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to cancel leave request.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));
