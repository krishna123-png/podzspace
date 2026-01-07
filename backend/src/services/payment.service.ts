import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export const createRazorpayOrder = async (amount: number, bookingId: string) => {
  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: bookingId,
    notes: {
      bookingId,
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    throw new Error('Failed to create Razorpay order');
  }
};

export const verifyRazorpayPayment = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean => {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpaySignature;
};

export const capturePayment = async (paymentId: string, amount: number) => {
  try {
    const payment = await razorpay.payments.capture(paymentId, amount * 100, 'INR');
    return payment;
  } catch (error) {
    throw new Error('Failed to capture payment');
  }
};

// Transfer funds to studio owner's account
export const transferToStudioOwner = async (
  amount: number,
  accountId: string,
  notes: any
) => {
  try {
    const transfer = await razorpay.transfers.create({
      account: accountId,
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      notes: notes,
    });
    return transfer;
  } catch (error) {
    console.error('Transfer error:', error);
    throw new Error('Failed to transfer funds to studio owner');
  }
};

// Create linked account for studio owner (Route)
export const createLinkedAccount = async (userData: {
  email: string;
  name: string;
  phone: string;
  accountNumber: string;
  ifscCode: string;
}) => {
  try {
    const account = await razorpay.accounts.create({
      email: userData.email,
      phone: userData.phone,
      type: 'route',
      legal_business_name: userData.name,
      business_type: 'individual',
      contact_name: userData.name,
      profile: {
        category: 'services',
        subcategory: 'studio_rental',
      },
    });

    // Note: Bank account details should be added through Razorpay dashboard
    // The addBankAccount API method is not available in the current SDK version

    return { account };
  } catch (error) {
    console.error('Create linked account error:', error);
    throw new Error('Failed to create linked account');
  }
};
