import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  checkFavorite,
} from '../controllers/favorite.controller';

const router = Router();

router.post('/', authenticate, addFavorite);
router.delete('/:studioId', authenticate, removeFavorite);
router.get('/', authenticate, getFavorites);
router.get('/check/:studioId', authenticate, checkFavorite);

export default router;
