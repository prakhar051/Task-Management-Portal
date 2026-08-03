import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Decoupled Axios instance for auth endpoints to prevent ES module circular imports
const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Action sets token references
  setAccessToken: (token) => {
    set({ accessToken: token, isAuthenticated: !!token });
  },

  // Log in user accounts
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.post('/auth/login', { email, password });
      const { user, accessToken } = response.data.data;
      set({ user, accessToken, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login operation failed.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Register new team accounts
  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.post('/auth/register', { name, email, password, role });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Terminate active sessions
  logout: async () => {
    set({ loading: true });
    try {
      await authApi.post('/auth/logout');
    } catch (err) {
      console.warn('Logout server request failed, purging local session anyway.');
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false, error: null });
      localStorage.removeItem('user_session'); // Purge legacy session markers
    }
  },

  // Fetch current user details dynamically (session checks)
  checkAuth: async () => {
    const { accessToken } = get();
    if (!accessToken) {
      // Attempt a silent session refresh first
      const refreshed = await get().refreshSession();
      if (!refreshed) {
        set({ isAuthenticated: false });
        return;
      }
    }

    set({ loading: true });
    try {
      // Import apiClient dynamically to avoid circular references during init
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.get('/auth/me');
      set({ user: response.data.data.user, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  },

  // Dynamic session token rotation handshake
  refreshSession: async () => {
    try {
      const response = await authApi.post('/auth/refresh');
      const { accessToken } = response.data.data;
      set({ accessToken, isAuthenticated: true });
      return true;
    } catch (err) {
      set({ user: null, accessToken: null, isAuthenticated: false });
      return false;
    }
  },

  // Modify profile characteristics
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      const response = await apiClient.patch('/auth/profile', data);
      const updatedUser = response.data.data.user;
      set({ user: updatedUser, loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  },

  // Modify user accounts password credential
  changePassword: async (oldPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const { apiClient } = await import('../api/apiClient');
      await apiClient.patch('/auth/change-password', { oldPassword, newPassword });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Password change failed.';
      set({ error: errMsg, loading: false });
      return { success: false, error: errMsg };
    }
  }
}));
export default useAuthStore;
