import KnowledgeRepository from '../repositories/knowledge.repository.js';
import ActivityService from './activity.service.js';

class KnowledgeService {
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  async createCategory(user, data) {
    const slug = this.slugify(data.name);
    return KnowledgeRepository.createCategory({ ...data, slug });
  }

  async listCategories() {
    return KnowledgeRepository.listCategories();
  }

  async createArticle(user, data) {
    const slug = `${this.slugify(data.title)}-${Date.now().toString().slice(-4)}`;
    const article = await KnowledgeRepository.createArticle({
      ...data,
      slug,
      authorId: user.id
    });

    // Create Initial Version record
    await KnowledgeRepository.createVersion({
      articleId: article.id,
      versionNumber: 1,
      title: article.title,
      content: article.content,
      authorId: user.id
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entityType: 'KNOWLEDGE_ARTICLE',
      entityId: article.id,
      description: `Created knowledge article: "${article.title}"`
    });

    return article;
  }

  async updateArticle(user, id, data) {
    const current = await KnowledgeRepository.getArticleById(id);
    if (!current) throw new Error('Article not found.');

    const nextVersionNumber = (current.versions?.[0]?.versionNumber || 0) + 1;

    const updated = await KnowledgeRepository.updateArticle(id, {
      ...data,
      slug: data.title ? `${this.slugify(data.title)}-${Date.now().toString().slice(-4)}` : undefined
    });

    // Store version archive history
    await KnowledgeRepository.createVersion({
      articleId: id,
      versionNumber: nextVersionNumber,
      title: updated.title,
      content: updated.content,
      authorId: user.id
    });

    await ActivityService.logActivity({
      userId: user.id,
      action: 'UPDATE',
      entityType: 'KNOWLEDGE_ARTICLE',
      entityId: id,
      description: `Updated knowledge article: "${updated.title}" to version ${nextVersionNumber}`
    });

    return updated;
  }

  async getArticle(user, id) {
    const article = await KnowledgeRepository.getArticleById(id);
    if (!article) throw new Error('Article not found.');

    // Increment viewCount
    await KnowledgeRepository.updateArticle(id, {
      viewCount: article.viewCount + 1
    });

    return article;
  }

  async deleteArticle(user, id) {
    const article = await KnowledgeRepository.getArticleById(id);
    if (!article) throw new Error('Article not found.');

    await KnowledgeRepository.deleteArticle(id);

    await ActivityService.logActivity({
      userId: user.id,
      action: 'DELETE',
      entityType: 'KNOWLEDGE_ARTICLE',
      entityId: id,
      description: `Soft deleted article: "${article.title}"`
    });
  }

  async listArticles(filters) {
    return KnowledgeRepository.listArticles(filters);
  }

  // Favorite toggle
  async toggleFavorite(user, articleId) {
    const favorites = await KnowledgeRepository.listFavorites(user.id);
    const isFav = favorites.some((f) => f.articleId === articleId);

    if (isFav) {
      await KnowledgeRepository.removeFavorite(user.id, articleId);
      return { favorited: false };
    } else {
      await KnowledgeRepository.addFavorite(user.id, articleId);
      return { favorited: true };
    }
  }

  async listFavorites(user) {
    return KnowledgeRepository.listFavorites(user.id);
  }

  async getRecentArticles(user) {
    // Simply fetch published articles sorted by date
    const all = await KnowledgeRepository.listArticles({ status: 'PUBLISHED' });
    return all.slice(0, 5);
  }
}

export default new KnowledgeService();
