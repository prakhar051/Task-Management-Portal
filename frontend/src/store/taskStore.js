import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const initialFilters = {
  search: '',
  status: '',
  priority: '',
  type: '',
  projectId: '',
  assigneeId: '',
  reporterId: '',
  dueDate: ''
};

export const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  comments: [],
  attachments: [],
  labels: [], 
  filters: { ...initialFilters },
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  sortBy: 'createdAt',
  sortOrder: 'desc',
  isLoading: false,
  error: null,
  selectedIds: [],
  viewMode: 'kanban', 

  // Setters
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 } 
    }));
    get().fetchTasks();
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters }, pagination: { page: 1, limit: 10, total: 0, pages: 0 } });
    get().fetchTasks();
  },

  setSort: (sortBy, sortOrder) => {
    set({ sortBy, sortOrder });
    get().fetchTasks();
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
    get().fetchTasks();
  },

  // Multi-select bulk handlers
  toggleSelect: (id) => {
    set((state) => {
      const selectedIds = state.selectedIds.includes(id)
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id];
      return { selectedIds };
    });
  },

  toggleSelectAll: (ids) => {
    set((state) => {
      const allSelected = ids.every((id) => state.selectedIds.includes(id));
      const selectedIds = allSelected
        ? state.selectedIds.filter((id) => !ids.includes(id))
        : [...new Set([...state.selectedIds, ...ids])];
      return { selectedIds };
    });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  // Actions
  fetchTasks: async () => {
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

      const response = await apiClient.get('/tasks', { params });
      if (response.data.success) {
        set({
          tasks: response.data.tasks || [],
          pagination: response.data.pagination || get().pagination
        });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to retrieve tasks list.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTaskById: async (id) => {
    set({ isLoading: true, error: null, currentTask: null });
    try {
      const response = await apiClient.get(`/tasks/${id}`);
      if (response.data.success) {
        set({
          currentTask: response.data.data,
          comments: response.data.data?.comments || [],
          attachments: response.data.data?.attachments || []
        });
      }
      return response.data.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to retrieve task details.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post('/tasks', taskData);
      if (response.data.success) {
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create task.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/tasks/${id}`, taskData);
      if (response.data.success) {
        if (get().currentTask?.id === id) {
          set({ currentTask: response.data.data });
        }
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update task.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete(`/tasks/${id}`);
      if (response.data.success) {
        set({ selectedIds: get().selectedIds.filter((item) => item !== id) });
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete task.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  restoreTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch(`/tasks/${id}/restore`);
      if (response.data.success) {
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to restore task.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}/status`, { status });
      if (response.data.success) {
        if (get().currentTask?.id === id) {
          set((state) => ({
            currentTask: {
              ...state.currentTask,
              status: response.data.data.status,
              completionPercentage: response.data.data.completionPercentage
            }
          }));
        }
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  updateTaskProgress: async (id, completionPercentage) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}/progress`, { completionPercentage });
      if (response.data.success) {
        if (get().currentTask?.id === id) {
          set((state) => ({
            currentTask: { ...state.currentTask, completionPercentage: response.data.data.completionPercentage }
          }));
        }
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  assignAssignees: async (id, employeeIds) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}/assignees`, { employeeIds });
      if (response.data.success) {
        if (get().currentTask?.id === id) {
          set((state) => ({
            currentTask: { ...state.currentTask, assignees: response.data.data.assignees }
          }));
        }
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  updateDependencies: async (id, dependsOnTaskIds) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}/dependencies`, { dependsOnTaskIds });
      if (response.data.success) {
        if (get().currentTask?.id === id) {
          get().fetchTaskById(id); 
        }
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Comments Actions
  fetchComments: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}/comments`);
      if (response.data.success) {
        set({ comments: response.data.data });
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  },

  addComment: async (taskId, comment) => {
    try {
      const response = await apiClient.post(`/tasks/${taskId}/comments`, { comment });
      if (response.data.success) {
        set((state) => ({
          comments: [response.data.data, ...state.comments]
        }));
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  updateComment: async (commentId, comment) => {
    try {
      const response = await apiClient.patch(`/tasks/comments/${commentId}`, { comment });
      if (response.data.success) {
        set((state) => ({
          comments: state.comments.map((c) => (c.id === commentId ? response.data.data : c))
        }));
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await apiClient.delete(`/tasks/comments/${commentId}`);
      if (response.data.success) {
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== commentId)
        }));
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Attachments Actions
  addAttachment: async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append('attachment', file);

      const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        set((state) => ({
          attachments: [response.data.data, ...state.attachments]
        }));
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  deleteAttachment: async (attachmentId) => {
    try {
      const response = await apiClient.delete(`/tasks/attachments/${attachmentId}`);
      if (response.data.success) {
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== attachmentId)
        }));
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Bulk Actions
  bulkDeleteTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete('/tasks/bulk', { data: { ids: get().selectedIds } });
      if (response.data.success) {
        set({ selectedIds: [] });
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to bulk delete tasks.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  bulkUpdateStatus: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch('/tasks/bulk-status', { ids: get().selectedIds, status });
      if (response.data.success) {
        set({ selectedIds: [] });
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to bulk update status.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  bulkUpdatePriority: async (priority) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch('/tasks/bulk-priority', { ids: get().selectedIds, priority });
      if (response.data.success) {
        set({ selectedIds: [] });
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to bulk update priority.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  bulkRestoreTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.patch('/tasks/bulk-restore', { ids: get().selectedIds });
      if (response.data.success) {
        set({ selectedIds: [] });
        get().fetchTasks();
      }
      return response.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to bulk restore tasks.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Export
  exportTasksCSV: async () => {
    try {
      const response = await apiClient.get('/tasks/export?format=csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `tasks_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export tasks', err);
    }
  }
}));
