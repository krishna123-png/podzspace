# Real Payment Integration Setup Guide

## Overview
Your PodzSpace platform now supports **real money transfers** from customers to studio owners using Razorpay Route (split payments).

## How It Works

### Payment Flow:
1. **Customer books a studio** → Pays ₹1000 through Razorpay
2. **Platform receives payment** → Holds the money temporarily
3. **Automatic split:**
   - Platform commission (15%): ₹150
   - Studio owner's share (85%): ₹850
4. **Instant transfer** → ₹850 automatically sent to owner's bank account
5. **Settlement** → Money appears in owner's bank within 1-2 business days

## Setup Instructions

### 1. Get Razorpay Account (Required)

Visit: https://dashboard.razorpay.com/signup

**For Testing (Development):**
- Sign up for Razorpay account
- Activate "Test Mode"
- Get Test API Keys:
  - Key ID: `rzp_test_...`
  - Key Secret: `...`

**For Production (Live Payments):**
- Complete KYC verification (PAN, GST, Bank details)
- Submit business documents
- Get approval (takes 1-2 days)
- Activate "Route" feature:
  - Go to Dashboard → Settings → Route
  - Enable Route/Marketplace features
  - This allows you to create linked accounts for studio owners

### 2. Update Environment Variables

**Backend (.env):**
```env
# Add these lines
RAZORPAY_KEY_ID="rzp_test_YOUR_KEY_ID"
RAZORPAY_KEY_SECRET="YOUR_SECRET_KEY"
```

**Render (Production):**
1. Go to your Render dashboard
2. Select `podzspace-backend` service
3. Environment tab → Add variables:
   - `RAZORPAY_KEY_ID` = Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET` = Your Razorpay Secret Key
4. Manually redeploy

### 3. Database Migration

The schema has been updated with new fields. Since local migration failed due to connection issues, you need to run migration from Render:

**Option A: Using Render Shell**
1. Go to Render dashboard → Your service
2. Click "Shell" tab
3. Run: `npx prisma db push`

**Option B: Deploy and auto-migrate**
The build command already includes migration, so just deploy:
```bash
git add .
git commit -m "Add Razorpay payment integration"
git push origin main
```

### 4. Studio Owner Onboarding

**For studio owners to receive payments:**

1. Studio owners navigate to: `/bank-setup` page
2. Fill in bank details:
   - Account holder name
   - Account number
   - IFSC code
   - Bank name
   - UPI ID (optional)
3. Click "Save Bank Details"
4. System creates a Razorpay "Linked Account" for them
5. They're now ready to receive payments!

**Important Notes:**
- Bank account must be in the owner's name
- IFSC code must be valid
- Account number will be masked after saving (security)
- In Test Mode, actual bank verification won't happen

## Testing the Payment Flow

### Test Mode (Development):
1. Use Razorpay test cards:
   - Card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

2. Make a test booking:
   - Customer pays ₹1000
   - Platform gets ₹150
   - Owner gets ₹850 (simulated transfer)

3. Check in Razorpay Dashboard:
   - Payments → See the ₹1000 payment
   - Transfers → See the ₹850 transfer to owner

### Production Mode (Live):
- Real money will be transferred
- Customer pays with actual card/UPI
- Owner receives money in bank account within 1-2 days
- You (platform) keep 15% commission automatically

## Code Changes Made

### Backend:
1. **Schema (Prisma):**
   - Added bank account fields to User model
   - Added Razorpay fields to Payment model (transfer tracking)

2. **Payment Service:**
   - `createLinkedAccount()` - Creates Razorpay account for studio owners
   - `transferToStudioOwner()` - Transfers money to owner's account
   - Razorpay order creation and verification

3. **Payment Controller:**
   - `/api/payments/setup-bank` - Save bank details endpoint
   - Auto-transfer logic after payment verification
   - Transfer status tracking

4. **Routes:**
   - New `/api/payments` routes for payment handling

### Frontend:
1. **BankAccountSetupPage:**
   - UI for studio owners to add bank details
   - Form validation
   - Masked account number display

2. **Updated Payment Flow:**
   - Razorpay checkout integration
   - Payment verification callback
   - Success/failure handling

3. **API Integration:**
   - `paymentsAPI.setupBankAccount()`
   - `paymentsAPI.createOrder()`
   - `paymentsAPI.verifyPayment()`

## Security Features

✅ **Bank details encrypted** in database
✅ **Account numbers masked** in UI
✅ **Payment signature verification** (prevents tampering)
✅ **Razorpay PCI DSS compliant** (card data never touches your server)
✅ **HTTPS required** for all transactions
✅ **Role-based access** (only owners can set up accounts)

## Commission Structure

- Platform Fee: **15%** (adjustable in booking.controller.ts)
- Studio Owner Share: **85%**

To change commission:
```typescript
// backend/src/controllers/booking.controller.ts
const PLATFORM_FEE_PERCENTAGE = 0.15; // Change this value
```

## Monitoring Payments

### Razorpay Dashboard:
- **Payments**: See all customer payments
- **Transfers**: Track money sent to owners
- **Settlement**: Monitor when money reaches accounts
- **Reports**: Download transaction reports

### Your Database:
```sql
-- Check payments
SELECT * FROM payments WHERE "transferStatus" = 'PROCESSED';

-- Check pending transfers
SELECT * FROM payments WHERE "transferStatus" = 'PENDING';

-- Failed transfers
SELECT * FROM payments WHERE "transferStatus" = 'FAILED';
```

## Troubleshooting

### "Failed to create linked account"
- Check if Razorpay Route is enabled in your account
- Verify bank account details are correct
- Ensure IFSC code is valid
- Check API keys are correct

### "Transfer failed"
- Owner hasn't set up bank account yet
- Invalid bank account details
- Insufficient balance in platform account
- Check Razorpay dashboard for error details

### "Payment verification failed"
- Check RAZORPAY_KEY_SECRET is correct
- Ensure signature verification logic is working
- Check Razorpay webhook settings

## Next Steps

1. **Test the full flow:**
   - Create a studio owner account
   - Set up bank details at `/bank-setup`
   - Create a studio
   - Make a test booking as a customer
   - Verify payment and transfer in Razorpay dashboard

2. **Go Live:**
   - Complete Razorpay KYC
   - Enable Route feature
   - Update API keys to live mode
   - Deploy to production

3. **Add webhook (recommended):**
   - Set up Razorpay webhook for payment confirmations
   - Handle failed transfers automatically
   - Send email notifications

## Support Resources

- Razorpay Documentation: https://razorpay.com/docs/
- Route API Docs: https://razorpay.com/docs/route/
- Razorpay Support: support@razorpay.com
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

## Important Legal Notes

⚠️ **Before going live:**
- Ensure your business is registered
- Have proper Terms of Service
- Privacy Policy mentioning payment processing
- GST registration (if applicable in India)
- Compliance with local payment regulations

---

Your platform is now ready for real payments! 🎉
