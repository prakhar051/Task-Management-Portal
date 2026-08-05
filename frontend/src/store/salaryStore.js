import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useSalaryStore = create((set, get) => ({
  structures: [],
  activeStructure: null,
  loading: false,
  error: null,

  fetchStructures: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/salary');
      if (response.data.success) {
        set({ structures: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch salary structures.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchEmployeeStructure: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/salary/employee/${employeeId}`);
      if (response.data.success) {
        set({ activeStructure: response.data.data });
      }
    } catch (err) {
      set({ activeStructure: null });
    } finally {
      set({ loading: false });
    }
  },

  createStructure: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/salary', data);
      if (response.data.success) {
        await get().fetchStructures();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create structure.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateStructure: async (employeeId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/salary/employee/${employeeId}`, data);
      if (response.data.success) {
        await get().fetchStructures();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update structure.' });
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));
