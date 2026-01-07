import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
} from '../controllers/message.controller';

const router = Router();

router.post('/', authenticate, sendMessage);
router.get('/conversations', authenticate, getConversations);
router.get('/:conversationId', authenticate, getMessages);
router.patch('/:messageId/read', authenticate, markAsRead);

export default router;
