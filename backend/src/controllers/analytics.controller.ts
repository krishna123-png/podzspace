import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getOwnerAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Get all studios owned by the user
    const studios = await prisma.studio.findMany({
      where: { ownerId: req.userId },
      select: { id: true, name: true },
    });

    const studioIds = studios.map(s => s.id);

    // Total revenue
    const totalRevenue = await prisma.booking.aggregate({
      where: {
        studioId: { in: studioIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      _sum: { studioEarnings: true },
    });

    // Total bookings
    const totalBookings = await prisma.booking.count({
      where: {
        studioId: { in: studioIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await prisma.booking.findMany({
      where: {
        studioId: { in: studioIds },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
        studioEarnings: true,
        studio: {
          select: { name: true },
        },
      },
    });

    // Group by month
    const revenueByMonth: { [key: string]: number } = {};
    const bookingsByMonth: { [key: string]: number } = {};

    monthlyBookings.forEach(booking => {
      const month = new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + booking.studioEarnings;
      bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
    });

    const monthlyRevenue = Object.keys(revenueByMonth).map(month => ({
      month,
      revenue: revenueByMonth[month],
    }));

    const monthlyBookingCount = Object.keys(bookingsByMonth).map(month => ({
      month,
      count: bookingsByMonth[month],
    }));

    // Top performing studios
    const studioPerformance = await Promise.all(
      studios.map(async (studio) => {
        const revenue = await prisma.booking.aggregate({
          where: {
            studioId: studio.id,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
          _sum: { studioEarnings: true },
        });

        const bookingCount = await prisma.booking.count({
          where: {
            studioId: studio.id,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
          },
        });

        return {
          name: studio.name,
          revenue: revenue._sum.studioEarnings || 0,
          bookings: bookingCount,
        };
      })
    );

    // Booking status distribution
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      where: { studioId: { in: studioIds } },
      _count: true,
    });

    const statusDistribution = bookingsByStatus.map(item => ({
      status: item.status,
      count: item._count,
    }));

    // Upcoming bookings
    const upcomingBookings = await prisma.booking.count({
      where: {
        studioId: { in: studioIds },
        status: 'CONFIRMED',
        bookingDate: { gte: new Date() },
      },
    });

    res.json({
      totalRevenue: totalRevenue._sum.studioEarnings || 0,
      totalBookings,
      monthlyRevenue,
      monthlyBookingCount,
      studioPerformance: studioPerformance.sort((a, b) => b.revenue - a.revenue),
      statusDistribution,
      upcomingBookings,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
