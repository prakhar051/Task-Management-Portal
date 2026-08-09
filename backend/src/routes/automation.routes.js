import express from 'express';
import AutomationController from '../controllers/automation.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/run/:id', AutomationController.runRule);
router.get('/history', AutomationController.listHistory);

router.post('/', AutomationController.createRule);
router.get('/', AutomationController.listRules);
router.patch('/:id', AutomationController.updateRule);
router.delete('/:id', AutomationController.deleteRule);

export default router;
