# PodzSpace Backend

Backend API for PodzSpace - Podcast Studio Marketplace

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup PostgreSQL database (or use a cloud provider like Supabase)

3. Copy `.env.example` to `.env` and update with your database URL and secrets

4. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start development server:
```bash
npm run dev
```

Server will run on http://localhost:5000

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Studios
- GET `/api/studios` - Get all studios
- GET `/api/studios/search` - Search studios
- GET `/api/studios/:id` - Get studio by ID
- POST `/api/studios` - Create studio (owner only)
- PUT `/api/studios/:id` - Update studio (owner only)
- DELETE `/api/studios/:id` - Delete studio (owner only)

### Bookings
- POST `/api/bookings` - Create booking
- GET `/api/bookings/my-bookings` - Get user's bookings
- GET `/api/bookings/studio/:studioId` - Get studio's bookings (owner only)
- PATCH `/api/bookings/:id/status` - Update booking status
- PATCH `/api/bookings/:id/cancel` - Cancel booking

### Reviews
- POST `/api/reviews` - Create review
- GET `/api/reviews/studio/:studioId` - Get studio reviews
