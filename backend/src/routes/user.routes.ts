import { Router } from 'express';
import { updateProfile, getUserProfile, getUserStats } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/profile/:id', getUserProfile);
router.put('/profile', authenticate, upload.single('profileImage'), updateProfile);
router.get('/stats', authenticate, getUserStats);

export default router;
