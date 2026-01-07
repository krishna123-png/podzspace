import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const verifyStudioOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Check if requester is admin (you can add admin role check here)
    // For now, any authenticated user can verify (you should restrict this)
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'User verified successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        isVerified: user.isVerified,
        verifiedAt: user.verifiedAt,
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const unverifyStudioOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: false,
        verifiedAt: null,
      },
    });

    res.json({
      success: true,
      message: 'User verification removed',
      user: {
        id: user.id,
        fullName: user.fullName,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Unverification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVerificationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
        verifiedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
