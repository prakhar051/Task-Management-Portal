import { prisma } from '../config/db.js';

class AiRepository {
  async createConversation(userId, title) {
    return prisma.aiConversation.create({
      data: { userId, title }
    });
  }

  async getConversationById(id) {
    return prisma.aiConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async listConversations(userId) {
    return prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async deleteConversation(id) {
    return prisma.aiConversation.delete({
      where: { id }
    });
  }

  async appendMessage(conversationId, role, content) {
    return prisma.$transaction(async (tx) => {
      const message = await tx.aiMessage.create({
        data: { conversationId, role, content }
      });
      // Touch conversation updated timestamp
      await tx.aiConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });
      return message;
    });
  }

  // AI Suggestions
  async createSuggestion(data) {
    return prisma.aiSuggestion.create({ data });
  }

  async listSuggestions(entityType, entityId) {
    return prisma.aiSuggestion.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async applySuggestion(id) {
    return prisma.aiSuggestion.update({
      where: { id },
      data: { isApplied: true }
    });
  }
}

export default new AiRepository();
