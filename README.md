# Ordinal Strategy 🎮

A Next.js web application for Bitcoin Ordinals gaming and strategy, featuring wallet integration, game score tracking, and user profiles.

**Live Site:** [ordinalstrategy-nextjs-c4rb.vercel.app](https://ordinalstrategy-nextjs-c4rb.vercel.app)

---

## 🚀 Features

- **Xverse Wallet Integration** - Connect with Bitcoin addresses (SegWit, Taproot, Spark)
- **FoxJump Game** - Play and track your scores on the blockchain
- **User Profiles** - View stats, game history, and leaderboards
- **Supabase Backend** - Fast, scalable PostgreSQL database
- **Real-time Data** - Live Bitcoin prices and mempool stats
- **Responsive Design** - Works on desktop and mobile

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.6 with Turbopack
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Wallet:** Xverse (via sats-connect)
- **Deployment:** Vercel

---

## 📁 Project Structure

```
ordinalstrategy-nextjs/
├── app/
│   ├── api/              # API routes
│   ├── foxjump/          # Game page
│   ├── profile/          # User profile
│   ├── strategy/         # Strategy info page
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utilities (Supabase)
├── public/foxjump/       # Game assets
└── .env.local            # Environment variables
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/Blazekachu/ordinalstrategy-nextjs.git
cd ordinalstrategy-nextjs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Optional: Privy (if using)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### 4. Set up Supabase Database

Run the SQL schema in your Supabase SQL Editor:

```bash
# See supabase_schema.sql for the full schema
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 How It Works

1. **Connect Wallet** - Click "Join" and connect your Xverse wallet
2. **Play Games** - Navigate to FoxJump and start playing
3. **Track Progress** - View your scores, stats, and rank on your profile
4. **Compete** - Climb the leaderboard!

---

## 📊 Database Schema

### Users Table
- User profiles with wallet addresses
- Game statistics (total score, games played, high score)
- Bitcoin addresses (SegWit, Taproot, Spark)

### Game Scores Table
- Individual game records
- Score, level, coins, play time
- Linked to user profiles

---

## 🚢 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

Or use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

---

## 📝 API Routes

### `/api/user/profile`
- `GET` - Fetch user profile by wallet address
- `PUT` - Update user profile

### `/api/scores`
- `GET` - Fetch game scores (user or leaderboard)
- `POST` - Submit new game score

### `/api/leaderboard`
- `GET` - Fetch global leaderboard

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 🔗 Links

- **Live Site:** [ordinalstrategy-nextjs-c4rb.vercel.app](https://ordinalstrategy-nextjs-c4rb.vercel.app)
- **GitHub:** [Blazekachu/ordinalstrategy-nextjs](https://github.com/Blazekachu/ordinalstrategy-nextjs)

---

**Built with ❤️ for the Bitcoin Ordinals community**
