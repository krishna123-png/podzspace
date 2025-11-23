import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const PLATFORM_FEE_PERCENTAGE = 0.15; // 15% commission

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      studioId,
      bookingDate,
      startTime,
      endTime,
      totalHours,
      specialRequests,
      paymentMethod,
      paymentAmount,
    } = req.body;

    // Get studio
    const studio = await prisma.studio.findUnique({ where: { id: studioId } });
    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    // Check for conflicting bookings on the same date and overlapping time
    const bookingDateObj = new Date(bookingDate);
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        studioId,
        bookingDate: bookingDateObj,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({ 
        error: 'This time slot is already booked. Please choose a different time.' 
      });
    }

    // Calculate prices
    const totalPrice = studio.pricePerHour * totalHours;
    const platformFee = totalPrice * PLATFORM_FEE_PERCENTAGE;
    const studioEarnings = totalPrice - platformFee;

    // Create booking and payment together
    const booking = await prisma.booking.create({
      data: {
        studioId,
        creatorId: req.userId!,
        bookingDate: bookingDateObj,
        startTime,
        endTime,
        totalHours,
        totalPrice,
        platformFee,
        studioEarnings,
        specialRequests,
        status: 'CONFIRMED',
        payment: {
          create: {
            amount: paymentAmount,
            platformFee,
            studioAmount: studioEarnings,
            paymentMethod: paymentMethod || 'CARD',
            status: 'COMPLETED',
            transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: req.userId!,
          },
        },
      },
      include: {
        studio: {
          include: {
            owner: {
              select: { fullName: true, email: true },
            },
          },
        },
        payment: true,
      },
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { creatorId: req.userId },
      include: {
        studio: {
          include: {
            owner: {
              select: { fullName: true, phone: true, email: true },
            },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStudioBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { studioId } = req.params;

    // Verify ownership
    const studio = await prisma.studio.findUnique({ where: { id: studioId } });
    if (!studio || studio.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const bookings = await prisma.booking.findMany({
      where: { studioId },
      include: {
        creator: {
          select: { fullName: true, email: true, phone: true, profileImage: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { studio: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only studio owner can confirm/complete bookings
    if (booking.studio.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Booking status updated', booking: updatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { studio: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Can cancel if you're the creator or studio owner
    if (booking.creatorId !== req.userId && booking.studio.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Booking cancelled', booking: updatedBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
