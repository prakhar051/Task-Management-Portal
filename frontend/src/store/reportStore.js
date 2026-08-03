import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const initialFilters = {
  startDate: '',
  endDate: '',
  departmentId: '',
  projectId: '',
  employeeId: '',
  status: '',
  search: '',
  sort: 'newest'
};

export const useReportStore = create((set, get) => ({
  filters: { ...initialFilters },
  isLoading: false,
  error: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters }, error: null });
  },

  exportReport: async (reportType, format = 'csv') => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = {
        format,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      };

      const response = await apiClient.get(`/reports/${reportType}`, {
        params,
        responseType: 'blob'
      });

      // Extract filename from Content-Disposition if present
      let filename = `${reportType}_report_${Date.now()}.${format}`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const mimeType = format === 'pdf' ? 'application/pdf' : format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'text/csv';
      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (err) {
      set({ error: 'Failed to generate and download report file.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  }
}));
