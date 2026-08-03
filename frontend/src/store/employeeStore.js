import { create } from 'zustand';

export const useEmployeeStore = create((set, get) => ({
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,

  // Selected employee UUIDs for bulk updates
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
    designation: '',
    sortBy: '',
    sortOrder: 'asc',
    isDeleted: 'false'
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } // Reset to page 1 on filter changes
    }));
    get().fetchEmployees();
  },

  setPagination: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page }
    }));
    get().fetchEmployees();
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
      const allSelected = state.employees.every((emp) => state.selectedIds.includes(emp.id));
      return {
        selectedIds: allSelected
          ? state.selectedIds.filter((id) => !state.employees.map((e) => e.id).includes(id))
          : [...new Set([...state.selectedIds, ...state.employees.map((e) => e.id)])]
      };
    });
  },

  clearBulkSelection: () => {
    set({ selectedIds: [] });
  },

  // Fetch employees list
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get('/employees', { params });
      set({
        employees: response.data.data,
        pagination: response.data.pagination,
        loading: false
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to retrieve employee roster.',
        loading: false
      });
    }
  },

  // Fetch single employee card
  fetchEmployeeById: async (id) => {
    set({ loading: true, error: null, currentEmployee: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get(`/employees/${id}`);
      set({ currentEmployee: response.data.data, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to load employee profile.',
        loading: false
      });
    }
  },

  // Create new profile record
  createEmployee: async (data) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.post('/employees', data);
      set({ loading: false });
      get().fetchEmployees();
      return { success: true, data: response.data.data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed creating employee account.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Update existing profile
  updateEmployee: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.patch(`/employees/${id}`, data);
      set({ currentEmployee: response.data.data, loading: false });
      get().fetchEmployees();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed updating employee card.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Soft-delete employee
  deleteEmployee: async (id) => {
    try {
      const { apiClient } = await import('../api/apiClient');
      await apiClient.delete(`/employees/${id}`);
      get().fetchEmployees();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to soft delete employee.' };
    }
  },

  // Restore employee
  restoreEmployee: async (id) => {
    try {
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch(`/employees/${id}/restore`);
      get().fetchEmployees();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to restore employee.' };
    }
  },

  // Upload employee avatar image
  uploadAvatar: async (id, file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.patch(`/employees/${id}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      set({ currentEmployee: response.data.data, loading: false });
      get().fetchEmployees();
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Avatar upload failed.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Bulk soft delete action
  bulkDelete: async () => {
    try {
      const { selectedIds } = get();
      const { apiClient } = await import('../api/apiClient');
      await apiClient.delete('/employees/bulk', { data: { ids: selectedIds } });
      set({ selectedIds: [] });
      get().fetchEmployees();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Bulk delete failed.' };
    }
  },

  // Bulk status update action
  bulkUpdateStatus: async (status) => {
    try {
      const { selectedIds } = get();
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch('/employees/bulk-status', { ids: selectedIds, status });
      set({ selectedIds: [] });
      get().fetchEmployees();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Bulk status update failed.' };
    }
  },

  // Bulk restore action
  bulkRestore: async () => {
    try {
      const { selectedIds } = get();
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch('/employees/bulk-restore', { ids: selectedIds });
      set({ selectedIds: [] });
      get().fetchEmployees();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Bulk restore failed.' };
    }
  },

  // Export employee data as file download
  exportData: async (format) => {
    try {
      const { filters } = get();
      // Exclude pagination bounds from export query params
      const params = new URLSearchParams(filters).toString();

      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get(`/employees/export?format=${format}&${params}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `employees_export_${Date.now()}.${format === 'xlsx' ? 'xlsx' : 'csv'}`;
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
export default useEmployeeStore;
