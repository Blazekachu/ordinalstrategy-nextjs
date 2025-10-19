# 🚀 Quick Start Guide

Get your Ordinal Strategy Next.js app running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd ordinalstrategy-nextjs
npm install
```

## Step 2: Set Up Privy (Required)

1. **Create Privy Account**
   - Go to https://dashboard.privy.io/
   - Sign up or log in
   - Create a new app

2. **Get Your Credentials**
   - Copy your **App ID** (it starts with `clp...`)
   - Copy your **App Secret** from Settings

3. **Update `.env.local`**
   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your_actual_app_id_here
   PRIVY_APP_SECRET=your_actual_app_secret_here
   ```

## Step 3: Set Up MongoDB (Choose One)

### Option A: Use MongoDB Atlas (Easiest - Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Update `.env.local`:
   ```bash
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ordinalstrategy
   ```

### Option B: Use Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install mongodb
sudo systemctl start mongodb

# Update .env.local
MONGODB_URI=mongodb://localhost:27017/ordinalstrategy
```

## Step 4: Run the App!

```bash
npm run dev
```

Open http://localhost:3000 🎉

## ✅ Verify Everything Works

1. **Home page loads** - You should see the Matrix landing overlay
2. **Click "TRUE"** - Gate should disappear
3. **Click "count me in"** - Privy modal should appear
4. **Login with Twitter** - Should redirect to /profile
5. **Click mascot** - Should open FoxJump game

## 🎮 Test Game Score Tracking

1. Play FoxJump game
2. Check your profile page
3. Scores should appear in "History" tab
4. Check leaderboard

## 🐛 Common Issues

### "Privy is not defined"
- Check that `NEXT_PUBLIC_PRIVY_APP_ID` starts with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`

### "MongoDB connection failed"
- Verify MongoDB is running: `brew services list | grep mongo`
- Check connection string in `.env.local`

### "Cannot find module"
- Run `npm install` again
- Delete `.next` folder and restart

## 📱 Next Steps

1. Customize branding in `/public/`
2. Add your Privy App ID to `.env.local`
3. Set up MongoDB Atlas for production
4. Deploy to Vercel
5. Add more games!

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

That's it! You're ready to go! 🎊

