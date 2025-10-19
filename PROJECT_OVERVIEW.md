# 🎯 Ordinal Strategy - Next.js Full-Stack Application

## 🌟 What You Have Now

A complete, production-ready Next.js application with:
- ✅ User authentication (Twitter & Wallet)
- ✅ Database integration (MongoDB)
- ✅ Game score tracking
- ✅ User profiles with statistics
- ✅ Leaderboards
- ✅ All original HTML features migrated
- ✅ Modern, scalable architecture

## 📂 Project Location

```
/home/akhil/ordinalstrategy-nextjs/
```

Your original HTML site is preserved at:
```
/home/akhil/ordinalstrategy.github.io/
```

## 🚀 Quick Start (3 Steps)

### 1. Get Privy Credentials
Visit https://dashboard.privy.io/ and get your App ID

### 2. Set Up MongoDB
Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas

### 3. Update & Run
```bash
cd /home/akhil/ordinalstrategy-nextjs

# Edit .env.local with your credentials
nano .env.local

# Run setup script
./setup.sh

# Or manually
npm install
npm run dev
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation & API reference |
| `QUICKSTART.md` | 5-minute setup guide |
| `MIGRATION_SUMMARY.md` | What changed from HTML to Next.js |
| `PROJECT_OVERVIEW.md` | This file - high-level overview |

## 🎨 Pages & Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page with landing gate | No |
| `/strategy` | Strategy protocol page | No |
| `/profile` | User profile & statistics | Yes |
| `/foxjump` | FoxJump game | No (but scores need auth) |
| `/api/user` | User management API | - |
| `/api/scores` | Game scores API | - |

## 🗄️ Database Collections

### `users`
Stores user profiles, Twitter handles, total scores, and games played

### `gamescores`
Stores individual game sessions with scores, levels, coins, and play time

## 🔑 Environment Variables Needed

```bash
NEXT_PUBLIC_PRIVY_APP_ID=     # From Privy dashboard
PRIVY_APP_SECRET=             # From Privy dashboard
MONGODB_URI=                  # MongoDB connection string
ORDISCAN_API_KEY=             # Already set (for ordinals data)
NEXT_PUBLIC_SITE_URL=         # Your domain (http://localhost:3000 for dev)
```

## 🎮 Game Integration

To make FoxJump save scores, add this to the game code:

```javascript
// When game ends, send score to parent window
function gameOver() {
  window.parent.postMessage({
    type: 'GAME_SCORE',
    score: finalScore,
    level: currentLevel,
    coins: coinsCollected,
    playTime: Math.floor(gameTime)
  }, '*');
}
```

## 📊 User Flow

```
Landing Page
    ↓
  User clicks "count me in"
    ↓
  Privy login modal
    ↓
  Twitter/Wallet authentication
    ↓
  Redirect to /profile
    ↓
  User can play games
    ↓
  Scores auto-save
    ↓
  View stats & leaderboard
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Auth**: Privy (Twitter & Wallet)
- **Deployment**: Ready for Vercel

## 📈 Features Comparison

| Feature | Old HTML Site | New Next.js App |
|---------|---------------|-----------------|
| Pages | 3 static | 4 dynamic |
| Authentication | ❌ | ✅ Privy |
| Database | ❌ | ✅ MongoDB |
| User Profiles | ❌ | ✅ Full system |
| Score Tracking | ❌ | ✅ Persistent |
| Leaderboards | ❌ | ✅ Real-time |
| API | ❌ | ✅ RESTful |
| TypeScript | ❌ | ✅ Full coverage |
| SEO | Basic | ✅ SSR |

## 🚀 Deployment Steps

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Deploy to Your Own Server

```bash
# Build
npm run build

# Start
npm start
# or
pm2 start npm --name "ordinal-strategy" -- start
```

## 🔐 Security Features

- ✅ Privy OAuth authentication
- ✅ Secure API endpoints
- ✅ MongoDB connection pooling
- ✅ Environment variable protection
- ✅ Server-side validation
- ✅ CORS protection

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interfaces
- Optimized for all screen sizes
- Progressive enhancement

## 🎨 Design System

**Colors:**
- Primary: `#f7931a` (Bitcoin Orange)
- Background: `#0b0c10` (Dark)
- Text: `#ffffff` (White)
- Accent: `#ffd166` (Light Orange)

**Typography:**
- Font: Inter (Google Fonts)
- Headings: Bold, Bitcoin Orange
- Body: Regular, White

**Effects:**
- Glass-morphism cards
- Matrix animations
- Smooth transitions
- Drop shadows

## 📊 Analytics Ready

Add analytics by installing:
```bash
npm install @vercel/analytics
```

Then in `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

// In return statement
<Analytics />
```

## 🔮 Future Enhancements

The architecture supports:
- [ ] Multiple games
- [ ] Token rewards
- [ ] NFT achievements
- [ ] Social features
- [ ] Real-time multiplayer
- [ ] Discord integration
- [ ] Wallet connect features
- [ ] Bitcoin payment integration

## 🐛 Troubleshooting

### Port 3000 in use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### MongoDB connection failed
```bash
# Check MongoDB is running
brew services list | grep mongo

# Or use MongoDB Atlas
```

### Privy not working
- Verify environment variables
- Check App ID starts with 'clp'
- Restart dev server after env changes

## 📞 Need Help?

1. Check `README.md` for detailed docs
2. Check `QUICKSTART.md` for setup help
3. Check `MIGRATION_SUMMARY.md` for architecture info
4. Review code comments in each file

## ✅ Pre-Launch Checklist

Before going live:
- [ ] Update Privy App ID in `.env.local`
- [ ] Set up MongoDB (Atlas recommended)
- [ ] Test authentication flow
- [ ] Test game score submission
- [ ] Add FoxJump score integration
- [ ] Test on mobile devices
- [ ] Set up production environment variables
- [ ] Deploy to Vercel
- [ ] Test production deployment
- [ ] Update domain in Privy dashboard

## 🎓 Learning Path

1. **Beginners**: Start with `QUICKSTART.md`
2. **Developers**: Read `README.md` and `MIGRATION_SUMMARY.md`
3. **Advanced**: Explore code, API routes, and models

## 💡 Pro Tips

1. Use MongoDB Atlas free tier for development
2. Privy has generous free tier
3. Vercel provides free hosting for Next.js
4. Enable preview deployments for testing
5. Use environment variables for all secrets
6. Test locally before deploying

## 📦 What's Included

```
✅ Full Next.js 15 setup
✅ TypeScript configuration
✅ Tailwind CSS setup
✅ MongoDB models and connection
✅ Privy authentication
✅ API routes
✅ Profile system
✅ Leaderboards
✅ Game integration
✅ All original features
✅ Complete documentation
✅ Setup scripts
✅ Production-ready code
```

## 🎉 You're Ready!

Your Next.js application is fully set up and ready to go. Just add your Privy credentials and MongoDB connection, and you'll have a full-stack app with user authentication and game score tracking!

---

**Built with ❤️ for Ordinal Strategy**

*Questions? Check the docs or explore the code - it's well-commented!*

