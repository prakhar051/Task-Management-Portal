import express from 'express';
import AiController from '../controllers/ai.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/chat', AiController.chat);
router.get('/conversations', AiController.listConversations);
router.get('/conversations/:id', AiController.getConversation);
router.delete('/conversations/:id', AiController.deleteConversation);

router.post('/summarize', AiController.summarize);
router.post('/recommend', AiController.recommend);
router.post('/search', AiController.search);

export default router;
