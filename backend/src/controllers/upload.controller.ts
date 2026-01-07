import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../config/cloudinary';

export const uploadSingleImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'podzspace/profiles');

    res.json({
      success: true,
      imageUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

export const uploadMultipleImages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = await uploadMultipleToCloudinary(
      req.files as Express.Multer.File[],
      'podzspace/studios'
    );

    res.json({
      success: true,
      imageUrls,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
};
