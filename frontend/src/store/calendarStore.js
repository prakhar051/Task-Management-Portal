import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const initialFilters = {
  startDate: '',
  endDate: '',
  departmentId: '',
  employeeId: '',
  projectId: '',
  type: ''
};

export const useCalendarStore = create((set, get) => ({
  events: [],
  upcomingEvents: [],
  filters: { ...initialFilters },
  currentView: 'month', // 'month' | 'week' | 'day'
  selectedDate: new Date(),
  isLoading: false,
  error: null,

  setView: (view) => set({ currentView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchFeed();
  },
  resetFilters: () => {
    set({ filters: { ...initialFilters } });
    get().fetchFeed();
  },

  fetchFeed: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      const response = await apiClient.get('/calendar', { params });
      if (response.data.success) {
        set({ events: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch calendar feed.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUpcoming: async (limit = 5) => {
    try {
      const response = await apiClient.get('/calendar/upcoming', { params: { limit } });
      if (response.data.success) {
        set({ upcomingEvents: response.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch upcoming events', err);
    }
  },

  createEvent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/calendar/events', data);
      if (response.data.success) {
        get().fetchFeed();
        get().fetchUpcoming();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create calendar event.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEvent: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/calendar/events/${id}`, data);
      if (response.data.success) {
        get().fetchFeed();
        get().fetchUpcoming();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update calendar event.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  moveEvent: async (id, type, newStartDate, newEndDate) => {
    // Optimistically update event in store first for sub-second visual reactivity
    set((state) => ({
      events: state.events.map((ev) =>
        ev.id === id
          ? { ...ev, startDate: newStartDate, endDate: newEndDate }
          : ev
      )
    }));

    try {
      await apiClient.patch(`/calendar/events/${id}?drag=true`, {
        type,
        startDate: newStartDate,
        endDate: newEndDate
      });
      get().fetchUpcoming();
    } catch (err) {
      console.error('Failed to sync dragged event coordinate', err);
      // Re-fetch correct dates from server on failure
      get().fetchFeed();
    }
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete(`/calendar/events/${id}`);
      if (response.data.success) {
        get().fetchFeed();
        get().fetchUpcoming();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete calendar event.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));
