import { prisma } from '../config/db.js';

class KnowledgeRepository {
  // Category operations
  async createCategory(data) {
    return prisma.knowledgeCategory.create({ data });
  }

  async getCategoryById(id) {
    return prisma.knowledgeCategory.findUnique({
      where: { id },
      include: { articles: true }
    });
  }

  async listCategories() {
    return prisma.knowledgeCategory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // Article operations
  async createArticle(data) {
    return prisma.knowledgeArticle.create({
      data,
      include: { category: true, author: true }
    });
  }

  async updateArticle(id, data) {
    return prisma.knowledgeArticle.update({
      where: { id },
      data,
      include: { category: true, author: true }
    });
  }

  async getArticleById(id) {
    return prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true }
        },
        versions: {
          orderBy: { versionNumber: 'desc' }
        }
      }
    });
  }

  async deleteArticle(id) {
    return prisma.knowledgeArticle.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }

  async listArticles(filters = {}) {
    const where = { isDeleted: false };
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return prisma.knowledgeArticle.findMany({
      where,
      include: {
        category: true,
        author: {
          select: { id: true, name: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  // Versioning
  async createVersion(data) {
    return prisma.knowledgeVersion.create({ data });
  }

  // Favorites
  async addFavorite(userId, articleId) {
    return prisma.knowledgeFavorite.create({
      data: { userId, articleId }
    });
  }

  async removeFavorite(userId, articleId) {
    return prisma.knowledgeFavorite.delete({
      where: {
        userId_articleId: { userId, articleId }
      }
    });
  }

  async listFavorites(userId) {
    return prisma.knowledgeFavorite.findMany({
      where: { userId },
      include: {
        article: {
          include: { category: true }
        }
      }
    });
  }
}

export default new KnowledgeRepository();
