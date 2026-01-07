import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getOwnerAnalytics } from '../controllers/analytics.controller';

const router = Router();

router.get('/owner', authenticate, getOwnerAnalytics);

export default router;
