# 🚀 Complete Setup Guide - Ordinal Strategy

**Welcome!** This guide will help you set up the Ordinal Strategy website from scratch, even if you're new to development.

---

## 📋 Prerequisites

Before you start, make sure you have:

- ✅ Node.js installed (v18 or higher) - [Download here](https://nodejs.org/)
- ✅ A code editor (VS Code recommended) - [Download here](https://code.visualstudio.com/)
- ✅ Supabase account (free) - [Sign up here](https://supabase.com/)
- ✅ Git installed - [Download here](https://git-scm.com/)

---

## 🎯 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
# Navigate to project folder
cd ordinalstrategy-nextjs-1

# Install packages
npm install
```

### Step 2: Set Up Supabase Database

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com/)
   - Click "New Project"
   - Choose organization and fill in project details
   - Wait for project to initialize (~2 minutes)

2. **Get Your Database Keys:**
   - Go to Project Settings > API
   - Copy these three values:
     - Project URL
     - anon/public key
     - service_role key

3. **Create Database Tables:**
   - Go to SQL Editor in Supabase dashboard
   - Click "New Query"
   - Open `supabase_schema.sql` from this project
   - Copy the entire file contents
   - Paste into Supabase SQL Editor
   - Click "Run"
   - ✅ You should see "Success. No rows returned"

### Step 3: Configure Environment

Create a file named `.env.local` in the root folder with this content:

```bash
# Copy these from Supabase Project Settings > API
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Optional: Leave blank for now
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# These are pre-configured (optional APIs)
ORDISCAN_API_KEY=***REMOVED***
HIRO_API_KEY=***REMOVED***
UNISAT_API_KEY=***REMOVED***
OKX_ACCESS_KEY=***REMOVED***

# App settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=false
```

**⚠️ IMPORTANT:**
- Replace `your_anon_key_here` with your actual Supabase keys
- Never commit `.env.local` to git (it's already in .gitignore)
- Keep the `service_role key` secret!

### Step 4: Run the Development Server

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

✅ **Success!** You should see the Ordinal Strategy homepage!

---

## 🧪 Testing Your Setup

1. **Homepage loads** - You should see the Matrix landing overlay
2. **Click "Commit Changes"** - Gate should disappear
3. **Connect Wallet:**
   - Install [Xverse Wallet](https://www.xverse.app/) extension
   - Click "Join" button
   - Connect your Xverse wallet
4. **Test Profile:**
   - After connecting, you'll redirect to `/profile`
   - Should see your wallet address and balances
5. **Play Game:**
   - Click the mascot or go to `/foxjump`
   - Play the game
   - Score should save automatically
   - Check profile to see your score history

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module"

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Supabase client not configured"

**Solutions:**
1. Check that `.env.local` exists in root folder
2. Verify all three Supabase keys are filled in
3. No extra spaces or quotes around the keys
4. Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue: "Failed to connect to database"

**Solutions:**
1. Check Supabase project is active (not paused)
2. Verify you ran the `supabase_schema.sql` script
3. Check the tables exist: Go to Supabase > Table Editor
4. Should see `users` and `game_scores` tables

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: Xverse wallet not connecting

**Solutions:**
1. Install Xverse browser extension
2. Make sure you're on desktop (mobile requires Xverse app)
3. Refresh page and try again
4. Check browser console for errors (F12)

---

## 📱 Mobile Testing

The website works on mobile but requires Xverse app:

1. Install [Xverse Wallet app](https://www.xverse.app/)
2. Open Xverse app
3. Tap "Browser" at the bottom
4. Navigate to your website
5. Now you can connect wallet and play

---

## 🚀 Deploying to Production

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com/)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables:**
   - In Vercel project settings > Environment Variables
   - Add all your `.env.local` variables
   - Update `NEXT_PUBLIC_SITE_URL` to your domain

4. **Deploy:**
   - Click "Deploy"
   - Wait for build (~2-3 minutes)
   - ✅ Your site is live!

---

## 🔐 Security Best Practices

### DO:
- ✅ Keep `.env.local` local (never commit to git)
- ✅ Use `NEXT_PUBLIC_` prefix for client-side env vars
- ✅ Keep `SUPABASE_SERVICE_KEY` secret
- ✅ Enable Row Level Security in Supabase
- ✅ Use environment variables in Vercel for production

### DON'T:
- ❌ Commit `.env.local` to git
- ❌ Share your service role key publicly
- ❌ Hardcode API keys in components
- ❌ Use admin/service keys on client side

---

## 📚 File Structure

```
ordinalstrategy-nextjs-1/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (backend)
│   ├── profile/           # Profile page
│   ├── foxjump/          # Game page
│   └── page.tsx          # Homepage
├── components/            # React components
├── lib/                   # Utility functions
│   ├── config.ts         # Configuration
│   ├── constants.ts      # Constants
│   ├── utils.ts          # Helper functions
│   ├── api.ts            # API client
│   └── supabase.ts       # Supabase client
├── public/               # Static files
├── .env.local           # Environment variables (create this!)
├── ENV_SETUP.md         # Detailed env setup guide
└── README.md            # Project documentation
```

---

## 🎓 Learning Resources

- **Next.js:** https://nextjs.org/docs
- **React:** https://react.dev/learn
- **Supabase:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs

---

## 🆘 Getting Help

If you're stuck:

1. **Check the error message** - Often tells you exactly what's wrong
2. **Read the docs** - `ENV_SETUP.md` and `README.md`
3. **Check browser console** - Press F12 to see detailed errors
4. **Restart everything:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

---

## 🎉 Next Steps

Once everything is working:

1. **Customize the site:**
   - Edit colors in `lib/config.ts`
   - Change text in page components
   - Add your own branding

2. **Add features:**
   - More games
   - Social features
   - NFT integration
   - Token rewards

3. **Deploy to production:**
   - Follow Vercel deployment steps above
   - Share your site with the world!

---

**🚀 Happy Building!**

If you followed these steps, your Ordinal Strategy website should be fully functional. Enjoy!

