import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { 
  createRazorpayOrder, 
  verifyRazorpayPayment,
  transferToStudioOwner,
  createLinkedAccount 
} from '../services/payment.service';
import { prisma } from '../lib/prisma';

export const createPaymentOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, amount } = req.body;

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(amount, bookingId);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Verify signature
    const isValid = verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Get booking with studio owner details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        studio: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update payment status
    const payment = await prisma.payment.findFirst({
      where: {
        booking: {
          id: bookingId,
        },
      },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      // Transfer funds to studio owner if they have a linked account
      if (booking.studio.owner.razorpayAccountId) {
        try {
          const transfer = await transferToStudioOwner(
            booking.studioEarnings,
            booking.studio.owner.razorpayAccountId,
            {
              bookingId: booking.id,
              studioName: booking.studio.name,
            }
          );

          // Update payment with transfer ID
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              razorpayTransferId: transfer.id,
              transferStatus: 'PROCESSED',
            },
          });
        } catch (transferError) {
          console.error('Transfer error:', transferError);
          // Mark transfer as failed but payment is still successful
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              transferStatus: 'FAILED',
            },
          });
        }
      } else {
        // Studio owner hasn't set up bank details yet
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            transferStatus: 'PENDING',
          },
        });
      }
    }

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

export const getPaymentDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            studio: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user has access to this payment
    if (
      payment.userId !== req.userId &&
      payment.booking.studio.ownerId !== req.userId
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const setupBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      upiId,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'STUDIO_OWNER') {
      return res.status(403).json({ error: 'Only studio owners can set up bank accounts' });
    }

    // Create Razorpay linked account
    let razorpayAccountId = user.razorpayAccountId;

    if (!razorpayAccountId && accountNumber && ifscCode) {
      try {
        const { account } = await createLinkedAccount({
          email: user.email,
          name: accountHolderName || user.fullName,
          phone: user.phone || '',
          accountNumber,
          ifscCode,
        });
        razorpayAccountId = account.id;
      } catch (error) {
        console.error('Razorpay account creation error:', error);
        return res.status(500).json({ 
          error: 'Failed to create Razorpay account. Please check your bank details.' 
        });
      }
    }

    // Update user with bank details
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        upiId,
        razorpayAccountId,
      },
    });

    res.json({
      success: true,
      message: 'Bank account details updated successfully',
      user: {
        accountHolderName: updatedUser.accountHolderName,
        accountNumber: updatedUser.accountNumber,
        ifscCode: updatedUser.ifscCode,
        bankName: updatedUser.bankName,
        upiId: updatedUser.upiId,
      },
    });
  } catch (error) {
    console.error('Setup bank account error:', error);
    res.status(500).json({ error: 'Failed to update bank account details' });
  }
};
