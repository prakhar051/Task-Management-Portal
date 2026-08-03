import { create } from 'zustand';

export const useDepartmentStore = create((set, get) => ({
  departments: [],
  currentDepartment: null,
  departmentEmployees: [],
  statistics: null,
  loading: false,
  error: null,

  selectedIds: [],

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },

  filters: {
    search: '',
    status: '',
    managerId: '',
    location: '',
    sortBy: '',
    sortOrder: 'asc',
    isDeleted: 'false'
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }
    }));
    get().fetchDepartments();
  },

  setPagination: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }));
    get().fetchDepartments();
  },

  toggleSelect: (id) => {
    set((state) => {
      const isSelected = state.selectedIds.includes(id);
      return {
        selectedIds: isSelected
          ? state.selectedIds.filter((x) => x !== id)
          : [...state.selectedIds, id]
      };
    });
  },

  toggleSelectAll: () => {
    set((state) => {
      const allSelected = state.departments.every((d) => state.selectedIds.includes(d.id));
      return {
        selectedIds: allSelected
          ? state.selectedIds.filter((id) => !state.departments.map((d) => d.id).includes(id))
          : [...new Set([...state.selectedIds, ...state.departments.map((d) => d.id)])]
      };
    });
  },

  clearBulkSelection: () => {
    set({ selectedIds: [] });
  },

  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get('/departments', { params });
      set({
        departments: response.data.data,
        pagination: response.data.pagination,
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to retrieve departments roster.',
        loading: false
      });
    }
  },

  fetchDepartmentById: async (id) => {
    set({ loading: true, error: null, currentDepartment: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get(`/departments/${id}`);
      set({ currentDepartment: response.data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load department details.',
        loading: false
      });
    }
  },

  fetchDepartmentEmployees: async (id) => {
    set({ loading: true, error: null, departmentEmployees: [] });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get(`/departments/${id}/employees`);
      set({ departmentEmployees: response.data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to retrieve department employees list.',
        loading: false
      });
    }
  },

  fetchStatistics: async () => {
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get('/departments/statistics');
      set({ statistics: response.data.data });
    } catch (err) {
      console.error('Failed to load department statistics.', err);
    }
  },

  createDepartment: async (data) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.post('/departments', data);
      set({ loading: false });
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true, data: response.data.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed creating department.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  updateDepartment: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.patch(`/departments/${id}`, data);
      set({ currentDepartment: response.data.data, loading: false });
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed updating department.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  deleteDepartment: async (id) => {
    try {
      const { apiClient } = await import('../api/apiClient');
      await apiClient.delete(`/departments/${id}`);
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to soft delete department.' };
    }
  },

  restoreDepartment: async (id) => {
    try {
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch(`/departments/${id}/restore`);
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to restore department.' };
    }
  },

  assignManager: async (id, managerId) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.patch(`/departments/${id}/manager`, { managerId });
      set({ currentDepartment: response.data.data, loading: false });
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Manager assignment failed.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  assignEmployees: async (id, employeeIds) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch(`/departments/${id}/employees`, { employeeIds });
      set({ loading: false });
      get().fetchDepartmentEmployees(id);
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Employee assignment failed.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  bulkDelete: async () => {
    try {
      const { selectedIds } = get();
      const { apiClient } = await import('../api/apiClient');
      await apiClient.delete('/departments/bulk', { data: { ids: selectedIds } });
      set({ selectedIds: [] });
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Bulk delete failed.' };
    }
  },

  bulkUpdateStatus: async (status) => {
    try {
      const { selectedIds } = get();
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch('/departments/bulk-status', { ids: selectedIds, status });
      set({ selectedIds: [] });
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Bulk status update failed.' };
    }
  },

  bulkRestore: async () => {
    try {
      const { selectedIds } = get();
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch('/departments/bulk-restore', { ids: selectedIds });
      set({ selectedIds: [] });
      get().fetchDepartments();
      get().fetchStatistics();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Bulk restore failed.' };
    }
  },

  exportData: async (format) => {
    try {
      const { filters } = get();
      const params = new URLSearchParams(filters).toString();

      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get(`/departments/export?format=${format}&${params}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `departments_export_${Date.now()}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed downloading export data.' };
    }
  }
}));
export default useDepartmentStore;
