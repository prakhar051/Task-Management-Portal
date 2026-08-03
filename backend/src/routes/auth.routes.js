import { Router } from 'express';
import { register, login, refresh, logout, me, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/async.middleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));

// Protected auth endpoints
router.post('/logout', authenticateUser, asyncHandler(logout));
router.get('/me', authenticateUser, asyncHandler(me));
router.patch('/profile', authenticateUser, asyncHandler(updateProfile));
router.patch('/change-password', authenticateUser, asyncHandler(changePassword));

export default router;
