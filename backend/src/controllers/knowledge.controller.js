import KnowledgeService from '../services/knowledge.service.js';

class KnowledgeController {
  // Category routes
  async createCategory(req, res, next) {
    try {
      const category = await KnowledgeService.createCategory(req.user, req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  async listCategories(req, res, next) {
    try {
      const categories = await KnowledgeService.listCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  // Article routes
  async createArticle(req, res, next) {
    try {
      const article = await KnowledgeService.createArticle(req.user, req.body);
      res.status(201).json({ success: true, data: article });
    } catch (err) {
      next(err);
    }
  }

  async updateArticle(req, res, next) {
    try {
      const article = await KnowledgeService.updateArticle(req.user, req.params.id, req.body);
      res.json({ success: true, data: article });
    } catch (err) {
      next(err);
    }
  }

  async getArticle(req, res, next) {
    try {
      const article = await KnowledgeService.getArticle(req.user, req.params.id);
      res.json({ success: true, data: article });
    } catch (err) {
      next(err);
    }
  }

  async deleteArticle(req, res, next) {
    try {
      await KnowledgeService.deleteArticle(req.user, req.params.id);
      res.json({ success: true, message: 'Article deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

  async listArticles(req, res, next) {
    try {
      const filters = {
        categoryId: req.query.categoryId,
        status: req.query.status,
        search: req.query.search
      };
      const articles = await KnowledgeService.listArticles(filters);
      res.json({ success: true, data: articles });
    } catch (err) {
      next(err);
    }
  }

  async searchArticles(req, res, next) {
    try {
      const filters = { search: req.body.search };
      const articles = await KnowledgeService.listArticles(filters);
      res.json({ success: true, data: articles });
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req, res, next) {
    try {
      const result = await KnowledgeService.toggleFavorite(req.user, req.body.articleId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getRecent(req, res, next) {
    try {
      const recent = await KnowledgeService.getRecentArticles(req.user);
      res.json({ success: true, data: recent });
    } catch (err) {
      next(err);
    }
  }

  async listFavorites(req, res, next) {
    try {
      const favorites = await KnowledgeService.listFavorites(req.user);
      res.json({ success: true, data: favorites });
    } catch (err) {
      next(err);
    }
  }
}

export default new KnowledgeController();
