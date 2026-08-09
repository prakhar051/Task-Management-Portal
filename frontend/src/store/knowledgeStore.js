import { create } from 'zustand';
import { apiClient } from '../api/apiClient';

const useKnowledgeStore = create((set, get) => ({
  categories: [],
  articles: [],
  favorites: [],
  recent: [],
  currentArticle: null,
  loading: false,
  error: null,

  fetchCategories: async () => {
    try {
      const response = await apiClient.get('/knowledge/categories');
      if (response.data.success) {
        set({ categories: response.data.data });
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/knowledge/categories', categoryData);
      if (response.data.success) {
        get().fetchCategories();
        return true;
      }
    } catch (err) {
      console.error('Failed to create category', err);
      throw err;
    }
  },

  fetchArticles: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await apiClient.get(`/knowledge?${params.toString()}`);
      if (response.data.success) {
        set({ articles: response.data.data });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to retrieve articles.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchArticleById: async (id) => {
    set({ loading: true, error: null, currentArticle: null });
    try {
      const response = await apiClient.get(`/knowledge/${id}`);
      if (response.data.success) {
        set({ currentArticle: response.data.data });
        return response.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to retrieve article details.' });
    } finally {
      set({ loading: false });
    }
  },

  createArticle: async (articleData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/knowledge', articleData);
      if (response.data.success) {
        get().fetchArticles();
        return response.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create article.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateArticle: async (id, articleData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch(`/knowledge/${id}`, articleData);
      if (response.data.success) {
        get().fetchArticles();
        return response.data.data;
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update article.' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteArticle: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.delete(`/knowledge/${id}`);
      if (response.data.success) {
        set((state) => ({
          articles: state.articles.filter((a) => a.id !== id),
          currentArticle: state.currentArticle?.id === id ? null : state.currentArticle
        }));
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete article.' });
    } finally {
      set({ loading: false });
    }
  },

  toggleFavorite: async (articleId) => {
    try {
      const response = await apiClient.post('/knowledge/favorite', { articleId });
      if (response.data.success) {
        get().fetchFavorites();
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  },

  fetchFavorites: async () => {
    try {
      const response = await apiClient.get('/knowledge/favorites');
      if (response.data.success) {
        set({ favorites: response.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch favorites list', err);
    }
  },

  fetchRecent: async () => {
    try {
      const response = await apiClient.get('/knowledge/recent');
      if (response.data.success) {
        set({ recent: response.data.data });
      }
    } catch (err) {
      console.error('Failed to fetch recent articles', err);
    }
  }
}));

export default useKnowledgeStore;
