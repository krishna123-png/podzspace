import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

export default router;
