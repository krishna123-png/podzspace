# PodzSpace - Podcast Studio Marketplace

A full-stack web application connecting content creators with podcast studio owners. Built with React, Node.js, Express, PostgreSQL, and Prisma.

## 🎯 Project Overview

PodzSpace is an Airbnb-style marketplace for podcast studios where:
- **Creators** can search, filter, and book professional podcast studios
- **Studio Owners** can list their studios and manage bookings
- **Platform** earns a 15% commission on each booking

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Zustand (State Management)
- Axios
- Framer Motion (Animations)
- Lucide React (Icons)
- React Hot Toast (Notifications)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Bcrypt for password hashing

## 📁 Project Structure

```
podzspace/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── server.ts     # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
└── frontend/             # React + Vite app
    ├── src/
    │   ├── components/   # Reusable components
    │   ├── pages/        # Page components
    │   ├── lib/          # API client
    │   ├── store/        # State management
    │   └── App.tsx
    └── package.json
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (local or cloud like Supabase/Railway)
- Git

### 1. Setup Backend

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Update .env file with your database URL
# Edit backend/.env and set your PostgreSQL connection string:
# DATABASE_URL="postgresql://username:password@localhost:5432/podzspace"

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 2. Setup Frontend

```powershell
# Open new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

## 📊 Database Schema

### Users Table
- Stores both creators and studio owners
- Role-based access control (CREATOR, STUDIO_OWNER, ADMIN)
- Authentication with JWT

### Studios Table
- Studio listings with images, amenities, and pricing
- Location data (address, city, state)
- Owner relationship

### Bookings Table
- Booking details with date/time
- Status tracking (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- Pricing breakdown (total, platform fee, studio earnings)

### Payments Table
- Payment records
- Stripe integration ready
- Commission tracking

### Reviews Table
- Studio reviews and ratings
- Multiple rating categories (cleanliness, equipment, location, value)

## 🎨 Frontend Features

### Landing Page
- Professional hero section with gradient design
- Feature highlights
- How it works section
- Featured studios carousel
- Call-to-action sections

### Authentication
- Sign up as Creator or Studio Owner
- Login with email/password
- JWT token management
- Protected routes

### Search & Discovery
- Search studios by location
- Filter by price range, capacity, amenities
- Sort options
- Studio cards with ratings and pricing

### Studio Detail Page
- Image gallery
- Full studio information
- Amenities and equipment list
- Booking calendar
- Reviews section

### Dashboards
- **Creator Dashboard**: View bookings, browse studios
- **Owner Dashboard**: Manage studios, view bookings, track earnings

### Booking System
- Date and time selection
- Real-time availability checking
- Instant booking confirmation
- Booking management

## 🔐 Authentication Flow

1. User registers choosing role (Creator/Studio Owner)
2. Password is hashed with bcrypt
3. JWT token generated and stored in localStorage
4. Token sent with each API request
5. Protected routes check authentication

## 💳 Payment & Commission

- Platform charges 15% commission on each booking
- Total price calculated: `pricePerHour × totalHours`
- Platform fee: `totalPrice × 0.15`
- Studio earnings: `totalPrice - platformFee`
- Stripe Connect integration ready (placeholder in current version)

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for responsive layouts
- Works on all screen sizes (mobile, tablet, desktop)
- Touch-friendly UI elements

## 🎯 MVP Features Included

✅ User authentication (Creator & Studio Owner)
✅ Studio listing creation
✅ Search and filter studios
✅ Studio detail pages
✅ Booking system
✅ Basic dashboards
✅ Reviews system
✅ Responsive design
✅ Professional UI/UX

## 🚧 Future Enhancements

- Real payment integration with Stripe Connect
- Real-time chat between creators and owners
- Advanced search with map view
- Email notifications
- Mobile app (React Native)
- Admin dashboard
- Analytics for studio owners
- Calendar integration
- Image upload to cloud storage
- Social login (Google, Facebook)

## 🧪 Testing the Application

### 1. Create Accounts
- Register as Studio Owner
- Register as Creator

### 2. Studio Owner Flow
- Login as studio owner
- Go to dashboard
- Create a new studio with details
- View your studios

### 3. Creator Flow
- Login as creator
- Browse studios on search page
- Filter by location/price
- Click on a studio to view details
- Make a booking

### 4. Booking Management
- View bookings in "My Bookings"
- Check booking status
- (Studio owner can confirm/reject bookings)

## 🐛 Troubleshooting

### Database Connection Error
```powershell
# Make sure PostgreSQL is running
# Check your DATABASE_URL in backend/.env
# Run migrations: npm run prisma:migrate
```

### Frontend Not Loading
```powershell
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### CORS Errors
```powershell
# Make sure backend is running on port 5000
# Check FRONTEND_URL in backend/.env matches your frontend URL
```

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/podzspace"
JWT_SECRET="your-secret-key"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:5000/api"
```

## 🎓 For Your College Presentation

### Talking Points
1. **Problem**: Content creators struggle to find quality podcast studios
2. **Solution**: Marketplace platform connecting creators with studios
3. **Business Model**: 15% commission on bookings
4. **Market**: Growing podcast industry ($2B+ market)
5. **Tech Stack**: Modern, scalable, industry-standard technologies
6. **Features**: Search, booking, payments, reviews
7. **Future**: Mobile app, advanced features, expansion

### Demo Flow
1. Show landing page (professional design)
2. Register as creator
3. Search for studios
4. Book a studio
5. Switch to studio owner account
6. Show studio management dashboard

## 📄 License

MIT License - Feel free to use this project for learning and presentations.

## 👨‍💻 Developer

Built for college presentation - PodzSpace MVP

---

**Good luck with your presentation! 🎉**
