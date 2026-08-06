import { Router } from 'express';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware.js';
import CandidateController from '../controllers/candidate.controller.js';

const router = Router();

router.use(authenticateUser);

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), CandidateController.listCandidates);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), CandidateController.getCandidateById);

router.post('/', authorizeRoles('ADMIN'), CandidateController.createCandidate);
router.patch('/:id', authorizeRoles('ADMIN'), CandidateController.updateCandidate);
router.patch('/:id/stage', authorizeRoles('ADMIN'), CandidateController.changeStage);
router.delete('/:id', authorizeRoles('ADMIN'), CandidateController.deleteCandidate);
router.post('/:id/hire', authorizeRoles('ADMIN'), CandidateController.hireCandidate);
router.post('/:id/document', authorizeRoles('ADMIN'), CandidateController.linkDocument);

export default router;
