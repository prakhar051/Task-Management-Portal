import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const useMonitoringStore = create((set, get) => ({
  health: null,
  metricsHistory: [],
  logs: [],
  errors: [],
  jobs: [],
  jobExecutions: [],
  loading: false,
  error: null,

  fetchHealth: async () => {
    try {
      const res = await apiClient.get('/admin/monitoring/health');
      if (res.data.success) set({ health: res.data.data });
    } catch (err) {
      console.error('Failed to load system health:', err.message);
    }
  },

  fetchMetricsHistory: async () => {
    try {
      const res = await apiClient.get('/admin/monitoring/metrics');
      if (res.data.success) set({ metricsHistory: res.data.data });
    } catch (err) {
      console.error('Failed to load history metrics:', err.message);
    }
  },

  fetchLogs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.module) params.append('module', filters.module);
      const res = await apiClient.get(`/admin/monitoring/logs?${params.toString()}`);
      if (res.data.success) set({ logs: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch logs.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchErrors: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.resolutionStatus) params.append('resolutionStatus', filters.resolutionStatus);
      const res = await apiClient.get(`/admin/monitoring/errors?${params.toString()}`);
      if (res.data.success) set({ errors: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch error logs.' });
    } finally {
      set({ loading: false });
    }
  },

  resolveError: async (id) => {
    try {
      const res = await apiClient.patch(`/admin/monitoring/errors/${id}/resolve`);
      if (res.data.success) {
        set((state) => ({
          errors: state.errors.map((e) => (e.id === id ? { ...e, resolutionStatus: 'RESOLVED' } : e))
        }));
      }
    } catch (err) {
      console.error('Failed to resolve error:', err.message);
    }
  },

  fetchJobs: async () => {
    try {
      const res = await apiClient.get('/admin/monitoring/jobs');
      if (res.data.success) set({ jobs: res.data.data });
    } catch (err) {
      console.error('Failed to load scheduled jobs:', err.message);
    }
  },

  runJobNow: async (id) => {
    try {
      const res = await apiClient.post(`/admin/monitoring/jobs/${id}/run`);
      if (res.data.success) {
        get().fetchJobs();
        get().fetchJobExecutions();
        return true;
      }
    } catch (err) {
      console.error('Failed to run job:', err.message);
      throw err;
    }
  },

  updateJob: async (id, data) => {
    try {
      const res = await apiClient.patch(`/admin/monitoring/jobs/${id}`, data);
      if (res.data.success) get().fetchJobs();
    } catch (err) {
      console.error('Failed to toggle job settings:', err.message);
    }
  },

  fetchJobExecutions: async (jobId = '') => {
    try {
      const params = new URLSearchParams();
      if (jobId) params.append('jobId', jobId);
      const res = await apiClient.get(`/admin/monitoring/jobs/executions?${params.toString()}`);
      if (res.data.success) set({ jobExecutions: res.data.data });
    } catch (err) {
      console.error('Failed to load executions logs:', err.message);
    }
  }
}));

export default useMonitoringStore;
