import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const initialFilters = {
  search: '',
  isRead: '',
  priority: '',
  type: ''
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: null,
  filters: { ...initialFilters },
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isLoading: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }
    }));
    get().fetchNotifications();
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters }, pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    get().fetchNotifications();
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
    get().fetchNotifications();
  },

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination, sortBy, sortOrder } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const response = await apiClient.get('/notifications', { params });
      if (response.data.success) {
        set({
          notifications: response.data.notifications || [],
          pagination: response.data.pagination || get().pagination
        });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch notifications.' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Infinite Scroll fetch helper
  fetchMoreNotifications: async () => {
    const { pagination, isLoading } = get();
    if (isLoading || pagination.page >= pagination.pages) return;

    set({ isLoading: true });
    try {
      const { filters, sortBy, sortOrder } = get();
      const nextPage = pagination.page + 1;
      const params = {
        page: nextPage,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const response = await apiClient.get('/notifications', { params });
      if (response.data.success) {
        set((state) => ({
          notifications: [...state.notifications, ...(response.data.notifications || [])],
          pagination: {
            ...state.pagination,
            page: nextPage,
            total: response.data.pagination?.total || state.pagination.total
          }
        }));
      }
    } catch (err) {
      console.error('Failed to fetch more notifications', err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread');
      if (response.data.success) {
        set({ unreadCount: response.data.count || 0 });
      }
    } catch (err) {
      console.error('Failed to load unread count', err);
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      if (response.data.success) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }));
      }
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch('/notifications/read-all');
      if (response.data.success) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date().toISOString()
          })),
          unreadCount: 0
        }));
      }
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  },

  deleteNotification: async (id) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      if (response.data.success) {
        set((state) => {
          const target = state.notifications.find((n) => n.id === id);
          const wasUnread = target && !target.isRead;
          return {
            notifications: state.notifications.filter((n) => n.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          };
        });
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  },

  deleteBulkNotifications: async (ids) => {
    try {
      const response = await apiClient.delete('/notifications/bulk', { data: { ids } });
      if (response.data.success) {
        get().fetchNotifications();
        get().fetchUnreadCount();
      }
    } catch (err) {
      console.error('Failed to delete notifications bulk', err);
    }
  },

  fetchPreferences: async () => {
    try {
      const response = await apiClient.get('/notifications/preferences');
      if (response.data.success) {
        set({ preferences: response.data.data });
      }
    } catch (err) {
      console.error('Failed to load notification preferences', err);
    }
  },

  updatePreferences: async (data) => {
    try {
      const response = await apiClient.patch('/notifications/preferences', data);
      if (response.data.success) {
        set({ preferences: response.data.data });
      }
      return response.data;
    } catch (err) {
      console.error('Failed to update notification preferences', err);
      throw err;
    }
  },

  exportNotificationsCSV: async () => {
    try {
      const { filters } = get();
      const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const response = await apiClient.get('/notifications/export?format=csv', {
        params,
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `notifications_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export notifications CSV', err);
    }
  }
}));
