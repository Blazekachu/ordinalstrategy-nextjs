# Ordinal Strategy 🎮

> **Precision in Bitcoin Ordinals** - A Next.js web application for Bitcoin Ordinals gaming and strategy, featuring Xverse wallet integration, game score tracking, and user profiles.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Live Site:** [ordinalstrategy-nextjs-c4rb.vercel.app](https://ordinalstrategy-nextjs-c4rb.vercel.app)

---

## ✨ Features

### 🔐 **Wallet Integration**
- **Xverse Wallet** - Full Bitcoin wallet support
- Multiple address types: Native SegWit, Taproot, Spark L2
- Real-time balance fetching
- Secure authentication

### 🎮 **Gaming**
- **FoxJump** - Retro-style jumping game
- Automatic score tracking
- Real-time leaderboards
- Detailed game history

### 👤 **User Profiles**
- Personal stats dashboard
- Game history & achievements
- Inscription collection viewer
- Multi-API inscription fetching (Ordiscan, Hiro, Unisat, OKX)

### 📊 **Live Data**
- Real-time Bitcoin price
- Mempool statistics
- Latest inscription numbers
- Block height tracking

### 🎨 **Modern UI**
- Matrix-style animated background
- Responsive design (mobile & desktop)
- Magnifying lens effect
- Smooth transitions & animations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works!)
- Xverse Wallet browser extension

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Blazekachu/ordinalstrategy-nextjs.git
cd ordinalstrategy-nextjs-1

# 2. Install dependencies
npm install

# 3. Set up environment (see ENV_SETUP.md for details)
# Create .env.local with your Supabase keys

# 4. Initialize database
# Run supabase_schema.sql in your Supabase SQL Editor

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

📖 **Need detailed setup instructions?** See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15.5.6 with Turbopack |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Privy (optional) + Xverse Wallet |
| **Wallet** | sats-connect |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
ordinalstrategy-nextjs-1/
├── app/                      # Next.js App Directory
│   ├── api/                 # Backend API routes
│   │   ├── user/           # User management
│   │   ├── scores/         # Game scores
│   │   ├── leaderboard/    # Leaderboards
│   │   └── spark/          # Spark L2 integration
│   ├── foxjump/            # Game page
│   ├── profile/            # User profile
│   ├── strategy/           # Info page
│   └── page.tsx            # Homepage
│
├── components/              # React Components
│   ├── PrivyProvider.tsx   # Auth wrapper
│   ├── XverseWalletProvider.tsx  # Wallet context
│   ├── ScrollButton.tsx    # Interactive button
│   └── MagnifyLens.tsx     # Lens effect
│
├── lib/                     # Core Libraries
│   ├── config.ts           # Configuration
│   ├── constants.ts        # App constants
│   ├── utils.ts            # Helper functions
│   ├── api.ts              # API client
│   └── supabase.ts         # Database client
│
├── public/                  # Static Assets
│   └── foxjump/            # Game assets
│
├── .env.local              # Environment config (create this!)
├── ENV_SETUP.md            # Environment setup guide
├── SETUP_GUIDE.md          # Complete setup instructions
└── supabase_schema.sql     # Database schema
```

---

## 📊 Database Schema

### `users` Table
```sql
- id (UUID, primary key)
- username (text, unique)
- wallet_address (text)
- spark_address (text)
- native_segwit_address (text)
- taproot_address (text)
- games_played (integer)
- total_score (integer)
- high_score (integer)
- inscription_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

### `game_scores` Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- score (integer)
- level (integer)
- coins_collected (integer)
- play_time (integer)
- game_type (text)
- created_at (timestamp)
```

---

## 🔌 API Endpoints

### User Management
- `GET /api/user/profile?walletAddress={address}` - Fetch user profile
- `PUT /api/user/profile` - Update user profile

### Game Scores
- `POST /api/scores` - Submit game score
- `GET /api/scores?walletAddress={address}&type=user` - Get user scores
- `GET /api/scores?type=leaderboard` - Get top scores

### Leaderboard
- `GET /api/leaderboard?sortBy={field}&limit={n}` - Get global leaderboard

### Spark L2
- `GET /api/spark/balance?address={address}` - Get Spark balance

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Import your repository
   - Add environment variables from `.env.local`
   - Deploy!

3. **Post-Deployment**
   - Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars
   - Add production domain to Privy dashboard (if using)
   - Test all features on production

### Manual Deployment
```bash
npm run build
npm run start
```

---

## 🎯 How It Works

1. **🏠 Landing** - Users see Bitcoin genesis message with Matrix animation
2. **🔗 Connect** - Click "Join" to connect Xverse wallet
3. **🎮 Play** - Navigate to FoxJump game and start playing
4. **📈 Track** - Scores automatically save to profile
5. **🏆 Compete** - Climb the global leaderboard!

---

## 🔧 Configuration

All configuration is centralized in `lib/config.ts`:

```typescript
import config from '@/lib/config';

// Access configuration
console.log(config.site.name);
console.log(config.colors.primary);
console.log(config.apis.mempool);
```

All constants are in `lib/constants.ts`:

```typescript
import { ROUTES, STORAGE_KEYS } from '@/lib/constants';

// Use constants
localStorage.setItem(STORAGE_KEYS.GATE_PASSED, '1');
router.push(ROUTES.PROFILE);
```

---

## 🧰 Utility Functions

Comprehensive utility functions available in `lib/utils.ts`:

```typescript
import { formatNumber, truncateAddress, copyToClipboard } from '@/lib/utils';

// Format numbers
formatNumber(1234567) // '1,234,567'

// Truncate addresses
truncateAddress('bc1qxy...', 8, 8) // 'bc1qxy...xyz'

// Copy to clipboard
await copyToClipboard('text') // true/false
```

---

## 🐛 Troubleshooting

### Common Issues

**"Supabase client not configured"**
- Check `.env.local` exists and has correct keys
- Restart dev server after changing env vars

**"Failed to connect wallet"**
- Install Xverse browser extension
- On mobile, use Xverse app browser

**"Database error"**
- Verify Supabase schema was run
- Check Supabase project is active

📖 **More solutions:** See [SETUP_GUIDE.md](SETUP_GUIDE.md#-common-issues--solutions)

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[ENV_SETUP.md](ENV_SETUP.md)** - Environment configuration guide
- **[supabase_schema.sql](supabase_schema.sql)** - Database schema

---

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Site:** [ordinalstrategy-nextjs-c4rb.vercel.app](https://ordinalstrategy-nextjs-c4rb.vercel.app)
- **GitHub:** [Blazekachu/ordinalstrategy-nextjs](https://github.com/Blazekachu/ordinalstrategy-nextjs)
- **Xverse Wallet:** [xverse.app](https://www.xverse.app/)
- **Supabase:** [supabase.com](https://supabase.com/)

---

## 🙏 Acknowledgments

- Bitcoin & Ordinals community
- Xverse Wallet team
- Next.js & React teams
- Supabase team

---

**Built with ❤️ for the Bitcoin Ordinals community**

**🚀 Ready to get started?** → [SETUP_GUIDE.md](SETUP_GUIDE.md)
