import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/cloudinary';
import { uploadSingleImage, uploadMultipleImages } from '../controllers/upload.controller';

const router = Router();

router.post('/single', authenticate, upload.single('image'), uploadSingleImage);
router.post('/multiple', authenticate, upload.array('images', 10), uploadMultipleImages);

export default router;
