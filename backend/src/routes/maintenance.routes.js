import express from 'express';
import MaintenanceController from '../controllers/maintenance.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateUser);

router.post('/', MaintenanceController.createRecord);
router.patch('/:id', MaintenanceController.updateRecord);
router.get('/:id', MaintenanceController.getRecordById);
router.get('/', MaintenanceController.listRecords);
router.delete('/:id', MaintenanceController.deleteRecord);

export default router;
