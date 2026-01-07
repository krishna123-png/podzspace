import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  verifyStudioOwner,
  unverifyStudioOwner,
  getVerificationStatus,
} from '../controllers/verification.controller';

const router = Router();

router.post('/verify/:userId', authenticate, verifyStudioOwner);
router.post('/unverify/:userId', authenticate, unverifyStudioOwner);
router.get('/status/:userId', getVerificationStatus);

export default router;
