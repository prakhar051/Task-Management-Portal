import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useTimesheetStore = create((set, get) => ({
  timesheets: [],
  monthlySummary: null,
  isLoading: false,
  error: null,

  fetchTimesheets: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/timesheets', { params });
      if (response.data.success) {
        set({ timesheets: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch timesheets.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMonthlySummary: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/timesheets/monthly', { params });
      if (response.data.success) {
        set({ monthlySummary: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to compile monthly productivity aggregates.' });
    } finally {
      set({ isLoading: false });
    }
  },

  exportTimesheetsCSV: async (filters = {}) => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/timesheets/export', {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timesheets-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export timesheet csv data', err);
    }
  }
}));
