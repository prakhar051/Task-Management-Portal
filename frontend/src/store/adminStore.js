import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const useAdminStore = create((set, get) => ({
  settings: null,
  smtpConfig: null,
  maintenanceConfig: null,
  apiKeys: [],
  templates: [],
  history: [],
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get('/admin/settings');
      if (res.data.success) set({ settings: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch settings.' });
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch('/admin/settings', data);
      if (res.data.success) {
        set({ settings: res.data.data });
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update settings.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchSmtpConfig: async () => {
    try {
      const res = await apiClient.get('/admin/monitoring/smtp');
      if (res.data.success) set({ smtpConfig: res.data.data });
    } catch (err) {
      console.error('Failed to load SMTP config:', err.message);
    }
  },

  updateSmtpConfig: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch('/admin/monitoring/smtp', data);
      if (res.data.success) {
        set({ smtpConfig: res.data.data });
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to configure SMTP.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  sendTestEmail: async (toEmail) => {
    try {
      const res = await apiClient.post('/admin/monitoring/smtp/test', { toEmail });
      return res.data.success;
    } catch (err) {
      console.error('SMTP check failed:', err.message);
      throw err;
    }
  },

  fetchApiKeys: async () => {
    try {
      const res = await apiClient.get('/admin/settings/keys');
      if (res.data.success) set({ apiKeys: res.data.data });
    } catch (err) {
      console.error('Failed to load API keys:', err.message);
    }
  },

  createApiKey: async (name, description) => {
    try {
      const res = await apiClient.post('/admin/settings/keys', { name, description });
      if (res.data.success) {
        get().fetchApiKeys();
        return res.data.data; // Includes rawKey to display once
      }
    } catch (err) {
      console.error('Failed to generate key:', err.message);
      throw err;
    }
  },

  revokeApiKey: async (id) => {
    try {
      const res = await apiClient.patch(`/admin/settings/keys/${id}/revoke`);
      if (res.data.success) get().fetchApiKeys();
    } catch (err) {
      console.error('Failed to revoke API key:', err.message);
    }
  },

  deleteApiKey: async (id) => {
    try {
      const res = await apiClient.delete(`/admin/settings/keys/${id}`);
      if (res.data.success) get().fetchApiKeys();
    } catch (err) {
      console.error('Failed to delete API key:', err.message);
    }
  },

  fetchMaintenanceConfig: async () => {
    try {
      const res = await apiClient.get('/admin/settings/maintenance');
      if (res.data.success) set({ maintenanceConfig: res.data.data });
    } catch (err) {
      console.error('Failed to load maintenance configuration:', err.message);
    }
  },

  updateMaintenanceConfig: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.patch('/admin/settings/maintenance', data);
      if (res.data.success) {
        set({ maintenanceConfig: res.data.data });
        return true;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update maintenance configuration.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  }
}));

export default useAdminStore;
