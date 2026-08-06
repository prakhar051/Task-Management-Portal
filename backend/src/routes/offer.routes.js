import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import OfferController from '../controllers/offer.controller.js';

const router = Router();

router.use(authenticateUser);

router.get('/', authorizeRoles('ADMIN'), OfferController.listOffers);
router.get('/:id', authorizeRoles('ADMIN'), OfferController.getOfferById);

router.post('/', authorizeRoles('ADMIN'), OfferController.createOffer);
router.patch('/:id', authorizeRoles('ADMIN'), OfferController.updateOffer);

export default router;
