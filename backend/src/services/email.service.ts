import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send booking confirmation email
export const sendBookingConfirmation = async (
  toEmail: string,
  bookingDetails: {
    customerName: string;
    studioName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    bookingId: string;
  }
) => {
  const mailOptions = {
    from: `PodzSpace <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Booking Confirmed - PodzSpace',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .detail-value { color: #111827; }
          .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎙️ Booking Confirmed!</h1>
            <p>Your podcast studio is ready</p>
          </div>
          <div class="content">
            <p>Hi ${bookingDetails.customerName},</p>
            <p>Great news! Your booking has been confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Studio:</span>
                <span class="detail-value">${bookingDetails.studioName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${bookingDetails.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${bookingDetails.startTime} - ${bookingDetails.endTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value">₹${bookingDetails.totalPrice}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingDetails.bookingId}</span>
              </div>
            </div>

            <p><strong>What to bring:</strong></p>
            <ul>
              <li>Valid ID proof</li>
              <li>Your creative content ideas</li>
              <li>Any personal equipment (optional)</li>
            </ul>

            <center>
              <a href="${process.env.FRONTEND_URL}/my-bookings" class="button">View Booking</a>
            </center>

            <p class="footer">
              Questions? Reply to this email or contact us at support@podzspace.com<br>
              © 2026 PodzSpace. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

// Send booking notification to studio owner
export const sendOwnerNotification = async (
  toEmail: string,
  bookingDetails: {
    ownerName: string;
    customerName: string;
    studioName: string;
    date: string;
    startTime: string;
    endTime: string;
    earnings: number;
  }
) => {
  const mailOptions = {
    from: `PodzSpace <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '💰 New Booking Received - PodzSpace',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .earnings { background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .earnings-amount { font-size: 36px; font-weight: bold; color: #10b981; }
          .booking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Booking!</h1>
            <p>You've got a new customer</p>
          </div>
          <div class="content">
            <p>Hi ${bookingDetails.ownerName},</p>
            <p>Great news! Someone just booked your studio "${bookingDetails.studioName}"</p>

            <div class="earnings">
              <p style="margin: 0; color: #6b7280;">You'll earn</p>
              <div class="earnings-amount">₹${bookingDetails.earnings}</div>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">(Platform fee already deducted)</p>
            </div>

            <div class="booking-info">
              <p><strong>Customer:</strong> ${bookingDetails.customerName}</p>
              <p><strong>Date:</strong> ${bookingDetails.date}</p>
              <p><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
            </div>

            <p><strong>Next steps:</strong></p>
            <ul>
              <li>Prepare your studio for the session</li>
              <li>Contact the customer if needed</li>
              <li>Ensure all equipment is ready</li>
            </ul>

            <center>
              <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px;">View Dashboard</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Owner notification email sent to:', toEmail);
  } catch (error) {
    console.error('Error sending owner notification email:', error);
  }
};

// Send booking reminder (24 hours before)
export const sendBookingReminder = async (
  toEmail: string,
  reminderDetails: {
    customerName: string;
    studioName: string;
    date: string;
    startTime: string;
    address: string;
  }
) => {
  const mailOptions = {
    from: `PodzSpace <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '⏰ Reminder: Your booking is tomorrow - PodzSpace',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;">
            <h1>⏰ Booking Reminder</h1>
            <p>Your session is tomorrow!</p>
          </div>
          <div style="background: #f9fafb; padding: 30px;">
            <p>Hi ${reminderDetails.customerName},</p>
            <p>This is a friendly reminder that your podcast studio booking is <strong>tomorrow</strong>!</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Studio:</strong> ${reminderDetails.studioName}</p>
              <p><strong>Date:</strong> ${reminderDetails.date}</p>
              <p><strong>Time:</strong> ${reminderDetails.startTime}</p>
              <p><strong>Location:</strong> ${reminderDetails.address}</p>
            </div>

            <p><strong>Tips for your session:</strong></p>
            <ul>
              <li>Arrive 10 minutes early</li>
              <li>Bring your ID and booking confirmation</li>
              <li>Test your microphone technique</li>
              <li>Stay hydrated!</li>
            </ul>

            <p>See you tomorrow! 🎙️</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking reminder sent to:', toEmail);
  } catch (error) {
    console.error('Error sending booking reminder:', error);
  }
};

export default transporter;
