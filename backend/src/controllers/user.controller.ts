import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, bio, profileImage } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { fullName, phone, bio, profileImage },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        profileImage: true,
        bio: true,
      },
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        role: true,
        profileImage: true,
        bio: true,
        createdAt: true,
        studios: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            city: true,
            images: true,
            pricePerHour: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stats;

    if (user.role === 'STUDIO_OWNER') {
      // Get studio owner stats
      const studios = await prisma.studio.findMany({
        where: { ownerId: userId },
      });

      const totalBookings = await prisma.booking.count({
        where: {
          studioId: { in: studios.map(s => s.id) },
        },
      });

      const reviews = await prisma.review.findMany({
        where: {
          studioId: { in: studios.map(s => s.id) },
        },
        select: { rating: true },
      });

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      stats = {
        totalStudios: studios.length,
        totalBookings,
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
      };
    } else {
      // Get creator stats
      const totalBookings = await prisma.booking.count({
        where: { creatorId: userId },
      });

      const totalReviews = await prisma.review.count({
        where: { userId },
      });

      stats = {
        totalBookings,
        totalReviews,
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
