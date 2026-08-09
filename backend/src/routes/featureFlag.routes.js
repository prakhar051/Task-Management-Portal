import express from 'express';
import FeatureFlagController from '../controllers/featureFlag.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
  }
  next();
};

router.use(authenticateUser);
router.use(verifyAdmin);

router.get('/', FeatureFlagController.listFlags);
router.post('/', FeatureFlagController.createFlag);
router.patch('/:id', FeatureFlagController.updateFlag);
router.delete('/:id', FeatureFlagController.deleteFlag);

export default router;
