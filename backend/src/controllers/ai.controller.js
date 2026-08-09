import AiService from '../services/ai.service.js';
import SummaryService from '../services/summary.service.js';
import RecommendationService from '../services/recommendation.service.js';

class AiController {
  async chat(req, res, next) {
    try {
      const { conversationId, message } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, message: 'Prompt message content required.' });
      }
      const result = await AiService.chat(req.user, conversationId, message);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async listConversations(req, res, next) {
    try {
      const list = await AiService.listConversations(req.user);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req, res, next) {
    try {
      const conv = await AiService.getConversation(req.user, req.params.id);
      res.json({ success: true, data: conv });
    } catch (err) {
      next(err);
    }
  }

  async deleteConversation(req, res, next) {
    try {
      await AiService.deleteConversation(req.user, req.params.id);
      res.json({ success: true, message: 'Conversation deleted.' });
    } catch (err) {
      next(err);
    }
  }

  async summarize(req, res, next) {
    try {
      const { type, id } = req.body;
      if (!type || !id) {
        return res.status(400).json({ success: false, message: 'Summary parameters type and id required.' });
      }
      const summary = await SummaryService.summarize(type, id);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  async recommend(req, res, next) {
    try {
      const recs = await RecommendationService.generateRecommendations();
      res.json({ success: true, data: recs });
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Search term query required.' });
      }
      const list = await AiService.search(req.user, query);
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }
}

export default new AiController();
