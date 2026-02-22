import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes';
import studioRoutes from './routes/studio.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import reviewRoutes from './routes/review.routes';
import paymentRoutes from './routes/payment.routes';
import uploadRoutes from './routes/upload.routes';
import favoriteRoutes from './routes/favorite.routes';
import analyticsRoutes from './routes/analytics.routes';
import verificationRoutes from './routes/verification.routes';
import messageRoutes from './routes/message.routes';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Make io available globally
export { io };

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-studio', (studioId: string) => {
     socket.join(`studio-${studioId}`);
    console.log(`User ${socket.id} joined studio-${studioId}`);
  });

  socket.on('join-owner-room', (ownerId: string) => {
    socket.join(`owner-${ownerId}`);
    console.log(`Owner ${ownerId} joined their room`);
  });

  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their personal room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'PodzSpace API is running' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 WebSocket server ready`);
});

export default app;
