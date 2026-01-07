import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  setupBankAccount,
} from '../controllers/payment.controller';

const router = Router();

router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/:paymentId', authenticate, getPaymentDetails);
router.post('/setup-bank', authenticate, setupBankAccount);

export default router;
