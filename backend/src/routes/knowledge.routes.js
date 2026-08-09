import express from 'express';
import KnowledgeController from '../controllers/knowledge.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/categories', KnowledgeController.createCategory);
router.get('/categories', KnowledgeController.listCategories);

router.get('/recent', KnowledgeController.getRecent);
router.get('/favorites', KnowledgeController.listFavorites);
router.post('/favorite', KnowledgeController.toggleFavorite);

router.post('/search', KnowledgeController.searchArticles);

router.post('/', KnowledgeController.createArticle);
router.get('/', KnowledgeController.listArticles);
router.get('/:id', KnowledgeController.getArticle);
router.patch('/:id', KnowledgeController.updateArticle);
router.delete('/:id', KnowledgeController.deleteArticle);

export default router;
