import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, studioId, rating, comment, cleanliness, equipment, location, value } = req.body;

    // Check if booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists for this booking' });
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        studioId,
        userId: req.userId!,
        rating,
        comment,
        cleanliness,
        equipment,
        location,
        value,
      },
      include: {
        user: {
          select: { fullName: true, profileImage: true },
        },
      },
    });

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStudioReviews = async (req: Request, res: Response) => {
  try {
    const { studioId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { studioId },
      include: {
        user: {
          select: { fullName: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
