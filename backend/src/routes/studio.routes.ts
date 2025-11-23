import { Router } from 'express';
import {
  createStudio,
  getStudios,
  getStudioById,
  updateStudio,
  deleteStudio,
  getMyStudios,
  searchStudios,
} from '../controllers/studio.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/search', searchStudios);
router.get('/my-studios', authenticate, authorizeRoles('STUDIO_OWNER'), getMyStudios);
router.get('/', getStudios);
router.get('/:id', getStudioById);
router.post('/', authenticate, authorizeRoles('STUDIO_OWNER'), createStudio);
router.put('/:id', authenticate, authorizeRoles('STUDIO_OWNER'), updateStudio);
router.delete('/:id', authenticate, authorizeRoles('STUDIO_OWNER'), deleteStudio);

export default router;
