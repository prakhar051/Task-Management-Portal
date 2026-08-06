import express from 'express';
import VendorController from '../controllers/vendor.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', VendorController.createVendor);
router.patch('/:id', VendorController.updateVendor);
router.get('/:id', VendorController.getVendorById);
router.get('/', VendorController.listVendors);
router.delete('/:id', VendorController.deleteVendor);

export default router;
