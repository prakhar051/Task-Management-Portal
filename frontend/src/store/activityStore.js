import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const initialFilters = {
  search: '',
  action: '',
  entityType: '',
  userId: '',
  startDate: '',
  endDate: ''
};

export const useActivityStore = create((set, get) => ({
  activities: [],
  entityActivities: [],
  filters: { ...initialFilters },
  pagination: { page: 1, limit: 15, total: 0, pages: 0 },
  isLoading: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }
    }));
    get().fetchActivities();
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters }, pagination: { page: 1, limit: 15, total: 0, pages: 0 } });
    get().fetchActivities();
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
    get().fetchActivities();
  },

  fetchActivities: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const response = await apiClient.get('/activity', { params });
      if (response.data.success) {
        set({
          activities: response.data.activities || [],
          pagination: response.data.pagination || get().pagination
        });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch activity logs.' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Infinite Scroll fetch helper
  fetchMoreActivities: async () => {
    const { pagination, isLoading } = get();
    if (isLoading || pagination.page >= pagination.pages) return;

    set({ isLoading: true });
    try {
      const { filters } = get();
      const nextPage = pagination.page + 1;
      const params = {
        page: nextPage,
        limit: pagination.limit,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const response = await apiClient.get('/activity', { params });
      if (response.data.success) {
        set((state) => ({
          activities: [...state.activities, ...(response.data.activities || [])],
          pagination: {
            ...state.pagination,
            page: nextPage,
            total: response.data.pagination?.total || state.pagination.total
          }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch more activities', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchEntityActivities: async (entityType, entityId) => {
    set({ isLoading: true, error: null, entityActivities: [] });
    try {
      const response = await apiClient.get(`/activity/entity/${entityType}/${entityId}`);
      if (response.data.success) {
        set({ entityActivities: response.data.data || [] });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch entity activities.' });
    } finally {
      set({ isLoading: false });
    }
  },

  exportActivityCSV: async () => {
    try {
      const { filters } = get();
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const response = await apiClient.get('/activity/export?format=csv', {
        params,
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `activity_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export activity CSV', err);
    }
  }
}));
