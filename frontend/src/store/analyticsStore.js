import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const initialFilters = {
  startDate: '',
  endDate: '',
  departmentId: '',
  projectId: '',
  employeeId: '',
  status: ''
};

export const useAnalyticsStore = create((set, get) => ({
  overview: null,
  employeeStats: null,
  deptStats: null,
  projectStats: null,
  taskStats: null,
  productivityStats: null,
  filters: { ...initialFilters },
  isLoading: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchOverview();
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters } });
    get().fetchOverview();
  },

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );

      const response = await apiClient.get('/analytics/overview', { params });
      if (response.data.success) {
        set({
          overview: response.data.data,
          employeeStats: response.data.data.employeeStats,
          deptStats: response.data.data.deptStats,
          projectStats: response.data.data.projectStats,
          taskStats: response.data.data.taskStats,
          productivityStats: response.data.data.productivityStats
        });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch overview analytics.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/analytics/employees', { params });
      if (response.data.success) {
        set({ employeeStats: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch employee analytics.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/analytics/departments', { params });
      if (response.data.success) {
        set({ deptStats: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch department analytics.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/analytics/projects', { params });
      if (response.data.success) {
        set({ projectStats: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch project analytics.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/analytics/tasks', { params });
      if (response.data.success) {
        set({ taskStats: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch task analytics.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProductivity: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/analytics/productivity', { params });
      if (response.data.success) {
        set({ productivityStats: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch productivity analytics.' });
    } finally {
      set({ isLoading: false });
    }
  }
}));
