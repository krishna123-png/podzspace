import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getStudioBookings,
  getBookingsForMyStudios,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/my-bookings', authenticate, getMyBookings);
router.get('/my-studios-bookings', authenticate, authorizeRoles('STUDIO_OWNER'), getBookingsForMyStudios);
router.get('/studio/:studioId', authenticate, authorizeRoles('STUDIO_OWNER'), getStudioBookings);
router.patch('/:id/status', authenticate, updateBookingStatus);
router.patch('/:id/cancel', authenticate, cancelBooking);

export default router;
