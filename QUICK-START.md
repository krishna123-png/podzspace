# 🚀 PodzSpace - Quick Start Card

## SETUP (First Time Only)

### Step 1: Install Everything
```powershell
# Double-click SETUP.bat
# OR manually:
cd backend
npm install
cd ../frontend
npm install
```

### Step 2: Setup Database
Get free PostgreSQL from https://supabase.com
Update `backend/.env` with your DATABASE_URL

### Step 3: Run Migrations
```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## RUNNING THE APP

### Option A: Use Batch Files
1. Double-click `start-backend.bat`
2. Double-click `start-frontend.bat`
3. Open http://localhost:5173

### Option B: Manual
**Terminal 1:**
```powershell
cd backend
npm run dev
```

**Terminal 2:**
```powershell
cd frontend
npm run dev
```

## FOR DEMO

### Quick Test Users:
1. Register as "Studio Owner"
   - Email: owner@test.com
   - Password: password123
   
2. Register as "Creator"
   - Email: creator@test.com
   - Password: password123

### Demo Flow:
1. Show landing page ✨
2. Register new user 👤
3. Search studios 🔍
4. View studio details 🏢
5. Make a booking 📅
6. Show dashboard 📊

## TROUBLESHOOTING

**Port 5000 busy?**
Edit `backend/.env`: `PORT=5001`
Edit `frontend/vite.config.ts` proxy to 5001

**Database error?**
Check DATABASE_URL in `backend/.env`

**Module errors?**
Run `npm install` in both folders

## PROJECT STRUCTURE

```
podzspace/
├── backend/           # API Server (Node.js)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── server.ts
│   └── prisma/
│       └── schema.prisma
│
└── frontend/          # React App
    └── src/
        ├── pages/
        ├── components/
        └── lib/

```

## KEY FEATURES

✅ User Authentication (2 roles)
✅ Studio Management  
✅ Search & Filters
✅ Booking System
✅ Review System
✅ Responsive Design
✅ Professional UI

## TECH STACK

**Frontend:** React + TypeScript + Tailwind CSS
**Backend:** Node.js + Express + TypeScript  
**Database:** PostgreSQL + Prisma ORM
**Auth:** JWT tokens

## BUSINESS MODEL

15% Commission on bookings
Example: $100/hr × 4hrs = $400
- Platform: $60 (15%)
- Studio: $340 (85%)

## URLS

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/health

## FILES TO KNOW

- `README.md` - Full documentation
- `SETUP-GUIDE.txt` - Detailed setup
- `DATABASE-SCHEMA.md` - Complete schema  
- `PRESENTATION-GUIDE.md` - How to present
- This file - Quick reference!

## IMPORTANT COMMANDS

```powershell
# Backend
cd backend
npm run dev              # Start server
npm run prisma:studio   # View database

# Frontend  
cd frontend
npm run dev             # Start app
npm run build           # Production build
```

## PRESENTATION TIPS

1. Practice demo 3 times before
2. Have both servers running
3. Browser ready at localhost:5173
4. Be confident - you built this!
5. Explain problem → solution → demo

## COMMON QUESTIONS & ANSWERS

**"Why this tech stack?"**
→ Industry standard, scalable, modern

**"How does payment work?"**
→ Stripe integration (15% commission)

**"Is it scalable?"**
→ Yes! Microservices-ready architecture

**"What's unique?"**
→ Podcast-specific, lower fees, better UX

## IF DEMO BREAKS

Don't panic! Options:
1. Explain the code instead
2. Show database schema
3. Walk through features
4. Show this as learning experience

## SUCCESS CHECKLIST

Before presenting:
- [ ] Both servers running
- [ ] Test accounts created
- [ ] Sample data added
- [ ] Browser ready
- [ ] Laptop charged
- [ ] You're confident!

## REMEMBER

🎯 You built a FULL STACK app
🎯 Professional code quality
🎯 Real business model
🎯 Modern design
🎯 You've got this!

---

**Questions? Check:**
- README.md (overview)
- SETUP-GUIDE.txt (technical setup)
- PRESENTATION-GUIDE.md (demo tips)
- DATABASE-SCHEMA.md (architecture)

**Good luck! You're going to do great! 🚀**
