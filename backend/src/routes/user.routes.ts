import { Router } from 'express';
import { updateProfile, getUserProfile, getUserStats } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile/:id', getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.get('/stats', authenticate, getUserStats);

export default router;
