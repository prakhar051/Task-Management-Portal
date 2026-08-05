import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useAttendanceStore = create((set, get) => ({
  attendance: null,
  logs: [],
  requests: [],
  isLoading: false,
  error: null,

  fetchTodayAttendance: async () => {
    set({ isLoading: true, error: null });
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/attendance', {
        params: { startDate: todayStr, endDate: todayStr }
      });
      if (response.data.success && response.data.data?.length > 0) {
        set({ attendance: response.data.data[0] });
      } else {
        set({ attendance: null });
      }
    } catch (err) {
      console.error('Failed to load today check-in state', err);
    } finally {
      set({ isLoading: false });
    }
  },

  checkIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/attendance/check-in');
      if (response.data.success) {
        set({ attendance: response.data.data });
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clock in.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  checkOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/attendance/check-out');
      if (response.data.success) {
        set({ attendance: response.data.data });
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to clock out.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  startBreak: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/attendance/break/start');
      if (response.data.success) {
        set({ attendance: response.data.data });
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start break.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  endBreak: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/attendance/break/end');
      if (response.data.success) {
        set({ attendance: response.data.data });
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to end break.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLogs: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/attendance', { params });
      if (response.data.success) {
        set({ logs: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load attendance logs.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/attendance/request');
      if (response.data.success) {
        set({ requests: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load requests.' });
    } finally {
      set({ isLoading: false });
    }
  },

  submitCorrection: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/attendance/request', data);
      if (response.data.success) {
        set((state) => ({ requests: [response.data.data, ...state.requests] }));
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit request.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  approveRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/attendance/request/${id}/approve`);
      if (response.data.success) {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? response.data.data : r))
        }));
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve request.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  rejectRequest: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/attendance/request/${id}/reject`, { rejectionReason: reason });
      if (response.data.success) {
        set((state) => ({
          requests: state.requests.map((r) => (r.id === id ? response.data.data : r))
        }));
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject request.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  }
}));
