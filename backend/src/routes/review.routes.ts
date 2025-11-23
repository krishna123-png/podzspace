import { Router } from 'express';
import { createReview, getStudioReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/studio/:studioId', getStudioReviews);

export default router;
