import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const useDocumentStore = create((set, get) => ({
  documents: [],
  selected: [],
  filters: { search: '', category: '', entityType: '', entityId: '' },
  versions: [],
  activeDocument: null,
  loading: false,
  uploadProgress: 0,
  error: null,
  pagination: { page: 1, limit: 10, totalPages: 1, total: 0 },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  resetFilters: () => {
    set({ filters: { search: '', category: '', entityType: '', entityId: '' } });
  },

  setSelected: (selectedIds) => {
    set({ selected: selectedIds });
  },

  fetchDocuments: async (customParams = {}) => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const response = await apiClient.get('/documents', {
        params: {
          search: filters.search,
          category: filters.category,
          entityType: filters.entityType,
          entityId: filters.entityId,
          page: pagination.page,
          limit: pagination.limit,
          ...customParams
        }
      });
      if (response.data.success) {
        set({
          documents: response.data.data.data,
          pagination: {
            page: response.data.data.page,
            limit: response.data.data.limit,
            totalPages: response.data.data.totalPages,
            total: response.data.data.total
          }
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch documents.';
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  fetchVersions: async (documentId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/documents/${documentId}`);
      if (response.data.success && response.data.data.data?.length > 0) {
        const doc = response.data.data.data[0];
        set({
          activeDocument: doc,
          versions: doc.versions || []
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch versions.';
      set({ error: msg });
    } finally {
      set({ loading: false });
    }
  },

  upload: async (file, meta) => {
    set({ loading: true, error: null, uploadProgress: 10 });
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (meta.name) formData.append('name', meta.name);
      if (meta.category) formData.append('category', meta.category);
      if (meta.entityType) formData.append('entityType', meta.entityType);
      if (meta.entityId) formData.append('entityId', meta.entityId);

      const response = await apiClient.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          set({ uploadProgress: progress });
        }
      });

      if (response.data.success) {
        await get().fetchDocuments();
        set({ uploadProgress: 0 });
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed.';
      set({ error: msg, uploadProgress: 0 });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  uploadVersion: async (documentId, file) => {
    set({ loading: true, error: null, uploadProgress: 10 });
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`/documents/${documentId}/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          set({ uploadProgress: progress });
        }
      });

      if (response.data.success) {
        await get().fetchVersions(documentId);
        set({ uploadProgress: 0 });
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Uploading version failed.';
      set({ error: msg, uploadProgress: 0 });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  archive: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/documents/${id}/archive`);
      if (response.data.success) {
        await get().fetchDocuments();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Archiving failed.';
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  restore: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/documents/${id}/restore`);
      if (response.data.success) {
        await get().fetchDocuments();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Restore failed.';
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  delete: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.delete(`/documents/${id}`);
      if (response.data.success) {
        await get().fetchDocuments();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete failed.';
      set({ error: msg });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  download: async (id, versionNumber) => {
    try {
      const response = await apiClient.get(`/documents/${id}/download`, {
        params: { version: versionNumber },
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const disposition = response.headers['content-disposition'];
      let filename = 'download';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  },

  bulkDownload: async (ids) => {
    try {
      const response = await apiClient.post(
        '/documents/bulk-download',
        { documentIds: ids },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bulk-export-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Bulk download failed:', err);
    }
  }
}));
