import express from 'express';
import AssetController from '../controllers/asset.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', AssetController.createAsset);
router.patch('/:id', AssetController.updateAsset);
router.get('/:id', AssetController.getAssetById);
router.get('/', AssetController.listAssets);
router.delete('/:id', AssetController.deleteAsset);

router.post('/assign', AssetController.assignAsset);
router.patch('/return/:assignmentId', AssetController.returnAsset);
router.post('/transfer', AssetController.transferAsset);
router.post('/depreciation', AssetController.calculateDepreciation);

export default router;
