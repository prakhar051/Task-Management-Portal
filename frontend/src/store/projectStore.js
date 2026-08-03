import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  projectEmployees: [],
  statistics: {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    onHoldProjects: 0,
    cancelledProjects: 0,
    overdueProjects: 0,
    endingWithin7Days: 0,
    averageProgress: 0,
    averageDuration: 0,
    totalMembers: 0,
    departmentDistribution: {},
    statusDistribution: {}
  },
  filters: {
    search: '',
    status: '',
    priority: '',
    departmentId: '',
    managerId: '',
    isDeleted: 'false',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  selectedIds: [],
  loading: false,
  error: null,

  // Fetch list
  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await apiClient.get('/projects', { params });
      set({
        projects: response.data.data || [],
        pagination: response.data.pagination,
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch projects directory.',
        loading: false
      });
    }
  },

  // Fetch by primary key
  fetchProjectById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/projects/${id}`);
      set({ currentProject: response.data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load project details.',
        loading: false
      });
    }
  },

  // Fetch members
  fetchProjectMembers: async (id) => {
    try {
      const response = await apiClient.get(`/projects/${id}/members`);
      set({ projectEmployees: response.data.data || [] });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load project members.' });
    }
  },

  // Fetch statistics
  fetchStatistics: async () => {
    try {
      const response = await apiClient.get('/projects/statistics');
      set({ statistics: response.data.data });
    } catch (err) {
      console.error('Failed to load project stats:', err);
    }
  },

  // Create project
  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/projects', data);
      await get().fetchProjects();
      await get().fetchStatistics();
      return { success: true, data: response.data.data };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to create project.'
      };
    }
  },

  // Update metadata
  updateProject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/projects/${id}`, data);
      set({ currentProject: response.data.data });
      await get().fetchProjects();
      await get().fetchStatistics();
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update project details.'
      };
    }
  },

  // Soft delete
  deleteProject: async (id) => {
    try {
      await apiClient.delete(`/projects/${id}`);
      await get().fetchProjects();
      await get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to soft delete project.'
      };
    }
  },

  // Restore
  restoreProject: async (id) => {
    try {
      await apiClient.patch(`/projects/${id}/restore`);
      await get().fetchProjects();
      await get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to restore project.'
      };
    }
  },

  // Assign Manager
  assignManager: async (id, managerId) => {
    set({ loading: true });
    try {
      const response = await apiClient.patch(`/projects/${id}/manager`, { managerId });
      set({ currentProject: response.data.data });
      await get().fetchProjects();
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to assign manager.'
      };
    }
  },

  // Assign Members
  assignMembers: async (id, membersList) => {
    set({ loading: true });
    try {
      const response = await apiClient.patch(`/projects/${id}/members`, { members: membersList });
      set({ currentProject: response.data.data });
      await get().fetchProjectMembers(id);
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to assign members.'
      };
    }
  },

  // Bulk soft delete
  bulkDelete: async () => {
    try {
      const { selectedIds } = get();
      await apiClient.delete('/projects/bulk', { data: { ids: selectedIds } });
      await get().fetchProjects();
      await get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to execute bulk delete.'
      };
    }
  },

  // Bulk status update
  bulkUpdateStatus: async (status) => {
    try {
      const { selectedIds } = get();
      await apiClient.patch('/projects/bulk-status', { ids: selectedIds, status });
      await get().fetchProjects();
      await get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to execute bulk status update.'
      };
    }
  },

  // Bulk restore
  bulkRestore: async () => {
    try {
      const { selectedIds } = get();
      await apiClient.patch('/projects/bulk-restore', { ids: selectedIds });
      await get().fetchProjects();
      await get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to execute bulk restore.'
      };
    }
  },

  // Export CSV / XLSX
  exportData: async (format) => {
    try {
      const response = await apiClient.get('/projects/export', {
        params: { format },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `projects_export.${format === 'csv' ? 'csv' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export projects data:', err);
    }
  },

  // Filter setters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to page 1 on filter
    }));
    get().fetchProjects();
  },

  // Pagination setters
  setPagination: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }));
    get().fetchProjects();
  },

  // Selection handlers
  toggleSelect: (id) => {
    set((state) => {
      const isSelected = state.selectedIds.includes(id);
      const selectedIds = isSelected
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id];
      return { selectedIds };
    });
  },

  toggleSelectAll: () => {
    set((state) => {
      const allSelected = state.projects.every((p) => state.selectedIds.includes(p.id));
      const selectedIds = allSelected ? [] : state.projects.map((p) => p.id);
      return { selectedIds };
    });
  },

  clearBulkSelection: () => {
    set({ selectedIds: [] });
  }
}));
