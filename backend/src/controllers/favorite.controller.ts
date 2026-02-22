import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { studioId } = req.body;

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.userId!,
        studioId,
      },
    });

    res.json({ success: true, favorite });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Studio already in favorites' });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { studioId } = req.params;

    await prisma.favorite.delete({
      where: {
        userId_studioId: {
          userId: req.userId!,
          studioId,
        },
      },
    });

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: {
        studio: {
          include: {
            owner: {
              select: { fullName: true, isVerified: true },
            },
            reviews: {
              select: { rating: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const checkFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { studioId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_studioId: {
          userId: req.userId!,
          studioId,
        },
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
