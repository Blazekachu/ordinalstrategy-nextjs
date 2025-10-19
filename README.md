# Ordinal Strategy - Next.js Application

A modern, feature-rich Next.js application for the Ordinal Strategy platform, complete with user authentication, game score tracking, and a comprehensive profile system.

## 🚀 Features

- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Privy Authentication** (Twitter & Wallet login)
- ✅ **MongoDB Database** for user data and game scores
- ✅ **API Routes** for backend functionality
- ✅ **Profile System** with game statistics and leaderboards
- ✅ **Matrix-style animations** on landing and strategy pages
- ✅ **Real-time Bitcoin data** (price, mempool, ordinals)
- ✅ **FoxJump game integration** with score tracking

## 📁 Project Structure

```
ordinalstrategy-nextjs/
├── app/
│   ├── api/
│   │   ├── scores/          # Game score API endpoints
│   │   └── user/            # User profile API endpoints
│   ├── foxjump/             # FoxJump game page
│   ├── profile/             # User profile page
│   ├── strategy/            # Strategy page
│   ├── layout.tsx           # Root layout with Privy provider
│   └── page.tsx             # Home page
├── components/
│   └── PrivyProvider.tsx    # Privy authentication wrapper
├── lib/
│   └── mongodb.ts           # MongoDB connection utility
├── models/
│   ├── User.ts              # User model schema
│   └── GameScore.ts         # Game score model schema
├── public/
│   ├── foxjump/             # FoxJump game assets
│   ├── osfun.png            # Logo
│   ├── osmascot.png         # Mascot image
│   └── rocket.png           # Rocket icon
└── .env.local               # Environment variables (gitignored)
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd ordinalstrategy-nextjs
npm install
```

### 2. Set Up Environment Variables

The `.env.local` file has been created with the following variables. **You need to update these with your actual values:**

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_app_secret_here

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ordinalstrategy
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ordinalstrategy

# API Keys
ORDISCAN_API_KEY=***REMOVED***

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Getting Privy API Keys:
1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or select existing one
3. Copy your App ID and App Secret
4. Update the `.env.local` file

#### Setting Up MongoDB:

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb    # Linux

# Start MongoDB
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongodb    # Linux
```

**Option 2: MongoDB Atlas (Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📖 API Documentation

### User API (`/api/user`)

**GET** - Fetch user profile
```bash
GET /api/user?privyId=USER_ID
```

**POST** - Create/Update user profile
```bash
POST /api/user
Body: {
  "privyId": "string",
  "twitterHandle": "string",
  "twitterId": "string",
  "walletAddress": "string"
}
```

### Scores API (`/api/scores`)

**GET** - Fetch scores
```bash
# Get leaderboard
GET /api/scores?type=leaderboard&limit=10

# Get user scores
GET /api/scores?privyId=USER_ID&type=user&limit=20
```

**POST** - Submit game score
```bash
POST /api/scores
Body: {
  "privyId": "string",
  "gameName": "foxjump",
  "score": number,
  "level": number,
  "coinsCollected": number,
  "playTime": number
}
```

## 🎮 Game Score Integration

To integrate score tracking in the FoxJump game, add this code when the game ends:

```javascript
// In foxjump/index.html
function submitScore(score, level, coins, playTime) {
  // Send message to parent window
  window.parent.postMessage({
    type: 'GAME_SCORE',
    score: score,
    level: level,
    coins: coins,
    playTime: playTime
  }, '*');
}

// Call this when game ends
// submitScore(finalScore, currentLevel, coinsCollected, playTimeInSeconds);
```

## 🔐 Authentication Flow

1. User clicks "count me in" on home page
2. Privy modal appears for Twitter/Wallet login
3. User authenticates
4. Redirected to `/profile` page
5. User profile is created in database
6. User can play games and track scores

## 📊 Database Models

### User Model
```typescript
{
  privyId: string;        // Unique Privy user ID
  twitterHandle?: string; // Twitter username
  twitterId?: string;     // Twitter ID
  walletAddress?: string; // Crypto wallet address
  totalScore: number;     // Cumulative score across all games
  gamesPlayed: number;    // Total games played
  createdAt: Date;
  updatedAt: Date;
}
```

### GameScore Model
```typescript
{
  userId: ObjectId;       // Reference to User
  gameName: string;       // 'foxjump'
  score: number;          // Game score
  level: number;          // Level reached
  coinsCollected: number; // Coins collected
  playTime: number;       // Time played in seconds
  createdAt: Date;
}
```

## 🎨 Pages

### Home Page (`/`)
- Matrix-style landing gate
- Live Bitcoin data (price, mempool, ordinals)
- Hero section with call-to-actions
- About, Mechanics, and Community sections
- Mascot with "up only" linking to game

### Strategy Page (`/strategy`)
- Matrix background with custom characters (*, +, -, /, #, @)
- Protocol mechanics explanation
- How it works section
- Community join CTA

### Profile Page (`/profile`)
- User statistics
- Game history table
- Leaderboard
- Play game CTA
- Protected route (requires authentication)

### FoxJump Game (`/foxjump`)
- Embedded game iframe
- Automatic score tracking
- Syncs with user profile

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Environment Variables for Production
Make sure to add all environment variables from `.env.local` to your deployment platform.

## 🔧 Development Tips

### Testing Database Connection
```bash
# In a separate terminal
node -e "require('./lib/mongodb.ts').default().then(() => console.log('Connected!'))"
```

### Viewing Database
- Use MongoDB Compass for local database
- Use MongoDB Atlas dashboard for cloud database

### Hot Reload
- Pages auto-reload on save
- API routes require manual refresh sometimes

## 📝 TODO / Future Enhancements

- [ ] Add more games
- [ ] Implement token rewards for high scores
- [ ] Add social sharing for achievements
- [ ] Create admin dashboard
- [ ] Add real-time multiplayer features
- [ ] Implement NFT minting for achievements

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list | grep mongodb  # macOS
systemctl status mongodb           # Linux

# Verify connection string
echo $MONGODB_URI
```

### Privy Issues
- Make sure your App ID and Secret are correct
- Check that your domain is whitelisted in Privy dashboard
- Verify environment variables are loaded

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## 📄 License

MIT

## 👨‍💻 Author

Ordinal Strategy Team

---

**Happy coding! 🚀**
