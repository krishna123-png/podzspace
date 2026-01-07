import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const createStudio = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      country,
      pricePerHour,
      capacity,
      size,
      images,
      amenities,
      equipment,
    } = req.body;

    const studio = await prisma.studio.create({
      data: {
        name,
        description,
        address,
        city,
        state,
        zipCode,
        country: country || 'USA',
        pricePerHour: parseFloat(pricePerHour),
        capacity: parseInt(capacity),
        size: size ? parseInt(size) : null,
        images: images || [],
        amenities: amenities || [],
        equipment: equipment || [],
        ownerId: req.userId!,
      },
    });

    res.status(201).json({ message: 'Studio created successfully', studio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStudios = async (req: Request, res: Response) => {
  try {
    const studios = await prisma.studio.findMany({
      where: { isActive: true },
      include: {
        owner: {
          select: { id: true, fullName: true, profileImage: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating for each studio
    const studiosWithRatings = studios.map((studio) => {
      const avgRating =
        studio.reviews.length > 0
          ? studio.reviews.reduce((sum, r) => sum + r.rating, 0) / studio.reviews.length
          : 0;
      return {
        ...studio,
        averageRating: avgRating,
        reviewCount: studio.reviews.length,
        reviews: undefined,
      };
    });

    res.json({ studios: studiosWithRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const searchStudios = async (req: Request, res: Response) => {
  try {
    const { city, state, minPrice, maxPrice, capacity, amenities, equipment, minRating, sortBy } = req.query;

    const where: any = { isActive: true };

    if (city) {
      where.city = { contains: city as string, mode: 'insensitive' };
    }

    if (state) {
      where.state = { contains: state as string, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.pricePerHour = {};
      if (minPrice) where.pricePerHour.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricePerHour.lte = parseFloat(maxPrice as string);
    }

    if (capacity) {
      where.capacity = { gte: parseInt(capacity as string) };
    }

    if (amenities) {
      const amenitiesArray = (amenities as string).split(',').filter(a => a.trim());
      if (amenitiesArray.length > 0) {
        where.amenities = { hasSome: amenitiesArray };
      }
    }

    if (equipment) {
      const equipmentArray = (equipment as string).split(',').filter(e => e.trim());
      if (equipmentArray.length > 0) {
        where.equipment = { hasSome: equipmentArray };
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { pricePerHour: 'asc' };
    if (sortBy === 'price_desc') orderBy = { pricePerHour: 'desc' };
    if (sortBy === 'name') orderBy = { name: 'asc' };

    const studios = await prisma.studio.findMany({
      where,
      include: {
        owner: {
          select: { id: true, fullName: true, profileImage: true, isVerified: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
    });

    const studiosWithRatings = studios.map((studio) => {
      const avgRating =
        studio.reviews.length > 0
          ? studio.reviews.reduce((sum, r) => sum + r.rating, 0) / studio.reviews.length
          : 0;
      return {
        ...studio,
        averageRating: avgRating,
        reviewCount: studio.reviews.length,
        reviews: undefined,
      };
    });

    // Filter by minimum rating if provided
    let filteredStudios = studiosWithRatings;
    if (minRating) {
      const minRatingValue = parseFloat(minRating as string);
      filteredStudios = studiosWithRatings.filter(s => s.averageRating >= minRatingValue);
    }

    res.json({ studios: filteredStudios, count: filteredStudios.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getStudioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const studio = await prisma.studio.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            email: true,
            phone: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: { fullName: true, profileImage: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!studio) {
      return res.status(404).json({ error: 'Studio not found' });
    }

    const avgRating =
      studio.reviews.length > 0
        ? studio.reviews.reduce((sum, r) => sum + r.rating, 0) / studio.reviews.length
        : 0;

    res.json({
      studio: {
        ...studio,
        averageRating: avgRating,
        reviewCount: studio.reviews.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyStudios = async (req: AuthRequest, res: Response) => {
  try {
    const studios = await prisma.studio.findMany({
      where: { ownerId: req.userId },
      include: {
        reviews: {
          select: { rating: true },
        },
        bookings: {
          where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const studiosWithStats = studios.map((studio) => {
      const avgRating =
        studio.reviews.length > 0
          ? studio.reviews.reduce((sum, r) => sum + r.rating, 0) / studio.reviews.length
          : 0;
      return {
        ...studio,
        averageRating: avgRating,
        reviewCount: studio.reviews.length,
        upcomingBookings: studio.bookings.length,
        bookings: undefined,
        reviews: undefined,
      };
    });

    res.json({ studios: studiosWithStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateStudio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check ownership
    const studio = await prisma.studio.findUnique({ where: { id } });
    if (!studio || studio.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedStudio = await prisma.studio.update({
      where: { id },
      data: req.body,
    });

    res.json({ message: 'Studio updated successfully', studio: updatedStudio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteStudio = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check ownership
    const studio = await prisma.studio.findUnique({ where: { id } });
    if (!studio || studio.ownerId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.studio.delete({ where: { id } });

    res.json({ message: 'Studio deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
