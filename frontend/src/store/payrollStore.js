import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

export const usePayrollStore = create((set, get) => ({
  payrolls: [],
  activePayroll: null,
  history: [],
  loading: false,
  error: null,

  fetchPayrolls: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/payroll');
      if (response.data.success) {
        set({ payrolls: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch payroll history runs.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchPayrollDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/payroll/${id}`);
      if (response.data.success) {
        set({ activePayroll: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load details.' });
    } finally {
      set({ loading: false });
    }
  },

  generatePayroll: async (month, year) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/payroll', { month, year });
      if (response.data.success) {
        await get().fetchPayrolls();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to generate payroll.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  approvePayroll: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/payroll/${id}/approve`);
      if (response.data.success) {
        await get().fetchPayrollDetails(id);
        await get().fetchPayrolls();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to approve payroll.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  payPayroll: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/payroll/${id}/pay`);
      if (response.data.success) {
        await get().fetchPayrollDetails(id);
        await get().fetchPayrolls();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to execute payment.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  cancelPayroll: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/payroll/${id}/cancel`);
      if (response.data.success) {
        await get().fetchPayrollDetails(id);
        await get().fetchPayrolls();
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to cancel payroll.' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchHistory: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/payroll/history/${employeeId}`);
      if (response.data.success) {
        set({ history: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to compile history.' });
    } finally {
      set({ loading: false });
    }
  },

  downloadPayslip: async (itemId, payslipNumber = 'payslip') => {
    try {
      const response = await apiClient.get(`/payroll/payslip/${itemId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${payslipNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Payslip download failed:', err);
    }
  }
}));
