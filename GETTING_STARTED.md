# 🎯 Getting Started - Absolute Beginner's Guide

**Welcome!** This guide is for people completely new to web development. We'll walk through everything step-by-step.

---

## 🤔 What is This Project?

This is a website that lets people:
- Connect their Bitcoin wallet (Xverse)
- Play a game (FoxJump)
- Track their scores
- See leaderboards

It's built with modern web technologies and you can customize it for your own needs!

---

## 📋 What You Need

### 1. Install Node.js

**What is Node.js?** It's software that lets you run JavaScript on your computer (not just in browsers).

**How to install:**
1. Go to https://nodejs.org/
2. Download the "LTS" version (recommended)
3. Run the installer
4. Accept all defaults
5. Verify installation:
   ```bash
   node --version
   # Should show: v18.x.x or higher
   ```

### 2. Install Visual Studio Code

**What is VS Code?** It's a text editor made for coding.

**How to install:**
1. Go to https://code.visualstudio.com/
2. Download and install
3. Open VS Code

### 3. Install Git

**What is Git?** It's version control software (tracks changes to your code).

**How to install:**
1. Go to https://git-scm.com/
2. Download and install
3. Accept all defaults
4. Verify installation:
   ```bash
   git --version
   # Should show: git version 2.x.x
   ```

### 4. Create Supabase Account

**What is Supabase?** It's a database service (stores your data in the cloud).

**How to create account:**
1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign up with email or GitHub
4. **Free tier is enough!**

---

## 🚀 Step-by-Step Setup

### Step 1: Get the Code

Open Terminal (Mac/Linux) or PowerShell (Windows):

```bash
# Navigate to where you want the project
cd Desktop

# Clone the project
git clone https://github.com/Blazekachu/ordinalstrategy-nextjs.git

# Go into the folder
cd ordinalstrategy-nextjs-1
```

**Explanation:**
- `cd Desktop` = Change directory to Desktop
- `git clone` = Download the project
- `cd ordinalstrategy-nextjs-1` = Enter the project folder

### Step 2: Open in VS Code

```bash
# Open VS Code in this folder
code .
```

OR manually: Open VS Code → File → Open Folder → Select the project folder

### Step 3: Install Dependencies

In VS Code, open Terminal (View → Terminal) and run:

```bash
npm install
```

**What's happening?** Installing all the code libraries the project needs. This takes 1-2 minutes.

**You'll see:** Progress messages, then "added 487 packages" (or similar)

### Step 4: Set Up Database

1. **Create Supabase Project:**
   - Log into https://supabase.com/
   - Click "New Project"
   - Fill in:
     - Name: `ordinalstrategy` (or anything you want)
     - Database Password: (create a strong password)
     - Region: (choose closest to you)
   - Click "Create new project"
   - **Wait 2 minutes** for it to initialize

2. **Get Your Keys:**
   - In your Supabase project dashboard
   - Click the "Settings" gear icon (bottom left)
   - Click "API" in the sidebar
   - You'll see three important things:
     - **Project URL** (looks like: https://abc123.supabase.co)
     - **anon/public key** (long string starting with "eyJ...")
     - **service_role key** (longer string, click "Reveal" to see it)
   - **Keep this page open!** You'll need these in the next step

3. **Create Database Tables:**
   - In Supabase, click "SQL Editor" in the sidebar
   - Click "New Query"
   - In VS Code, open file: `supabase_schema.sql`
   - **Copy the entire file contents**
   - **Paste** into Supabase SQL Editor
   - Click "Run" button
   - You should see: "Success. No rows returned"

### Step 5: Configure Environment

In VS Code:

1. Create a new file in the root folder
2. Name it: `.env.local` (exactly, with the dot at the start)
3. Paste this content:

```bash
# Supabase (REQUIRED - Fill these in!)
SUPABASE_URL=paste_your_project_url_here
SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_KEY=paste_your_service_role_key_here

# Privy (OPTIONAL - Leave blank for now)
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_SECRET=

# These are pre-filled (optional APIs)
ORDISCAN_API_KEY=***REMOVED***
HIRO_API_KEY=***REMOVED***
UNISAT_API_KEY=***REMOVED***
OKX_ACCESS_KEY=***REMOVED***

# App settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=false
```

4. **Replace** the three Supabase values with your actual keys:
   - Copy from the Supabase page you kept open
   - Paste into `.env.local`
   - Make sure there are no extra spaces

5. **Save the file** (Ctrl+S or Cmd+S)

### Step 6: Run the Website

In VS Code terminal, run:

```bash
npm run dev
```

**What's happening?** Starting the development server.

**You'll see:**
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Open your browser** and go to: http://localhost:3000

**🎉 Success!** You should see the Ordinal Strategy homepage!

---

## 🧪 Testing Your Setup

### 1. Homepage
- ✅ Matrix animation in background
- ✅ "Commit Changes" button appears
- ✅ Click it → gate disappears

### 2. Connect Wallet
First, **install Xverse:**
- Chrome: https://chrome.google.com/webstore (search "Xverse")
- Install the extension
- Create a wallet (follow their guide)

Then on the website:
- Click "Join" button
- Click "Connect Xverse Wallet"
- Accept in Xverse popup
- ✅ You should redirect to `/profile`

### 3. Profile Page
- ✅ Shows your wallet address
- ✅ Shows balance (might be 0.00000000)
- ✅ Has tabs: Profile, Addresses, Games, etc.

### 4. Play Game
- Click the fox mascot (top right)
- OR go to: http://localhost:3000/foxjump
- ✅ Game loads
- ✅ Use arrow keys to play
- ✅ When game ends, score should save
- ✅ Check profile → Games tab → see your score

---

## ❌ Common Problems & Solutions

### Problem: "npm: command not found"
**Solution:** Node.js not installed correctly
- Reinstall Node.js from https://nodejs.org/
- Restart your terminal
- Try again

### Problem: "Cannot find module"
**Solution:** Dependencies not installed
```bash
rm -rf node_modules
npm install
```

### Problem: "Port 3000 already in use"
**Solution:** Something else is using that port
```bash
# Stop the other process or use different port
PORT=3001 npm run dev
```

### Problem: "Supabase client not configured"
**Solution:** Check your `.env.local` file
- Make sure it exists in the root folder
- Make sure all three Supabase keys are filled in
- No extra spaces or quotes around the values
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

### Problem: Website loads but looks broken
**Solution:** Clear cache
```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

---

## 📝 Understanding the Code

Don't worry if you don't understand all the code yet! Here's a simple overview:

### Important Folders
```
ordinalstrategy-nextjs-1/
├── app/                  # Website pages
│   ├── page.tsx         # Homepage
│   ├── profile/         # Profile page
│   └── foxjump/         # Game page
├── components/           # Reusable UI pieces
├── lib/                  # Helper code
│   ├── config.ts        # Settings
│   ├── utils.ts         # Useful functions
│   └── supabase.ts      # Database connection
└── .env.local           # Your secret keys
```

### Making Changes

**To change text on homepage:**
1. Open `app/page.tsx`
2. Find the text you want to change
3. Edit it
4. Save
5. Refresh browser → see changes!

**To change colors:**
1. Open `lib/config.ts`
2. Find `colors:` section
3. Change the color values
4. Save and refresh

---

## 🎓 Next Steps

### Learn More
1. **Next.js Tutorial:** https://nextjs.org/learn
2. **React Tutorial:** https://react.dev/learn
3. **JavaScript Basics:** https://javascript.info/
4. **TypeScript Basics:** https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html

### Customize Your Site
1. Change the colors (see `lib/config.ts`)
2. Change text on pages
3. Add your own logo (replace files in `public/`)
4. Modify the game

### Deploy Online
Once everything works locally:
1. Push to GitHub (see SETUP_GUIDE.md)
2. Deploy to Vercel (free hosting)
3. Your site will be live on the internet!

---

## 🆘 Still Stuck?

1. **Read the error message** - It often tells you exactly what's wrong
2. **Check the documentation:**
   - [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup
   - [ENV_SETUP.md](ENV_SETUP.md) - Environment variables
   - [README.md](README.md) - Project overview
3. **Restart everything:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

---

## 🎉 You Did It!

Congratulations! You've set up a full-stack web application. This is a huge achievement!

**What you've learned:**
- ✅ Installing development tools
- ✅ Using the terminal/command line
- ✅ Setting up a database
- ✅ Running a web server
- ✅ Connecting services together

**Keep going! You're doing great! 🚀**

---

## 📚 Glossary

**Terms you might see:**

- **Frontend** = What users see (the website)
- **Backend** = Server/database (behind the scenes)
- **API** = Way for frontend and backend to talk
- **Node.js** = JavaScript runtime (runs JS on computer)
- **npm** = Package manager (installs code libraries)
- **Git** = Version control (tracks code changes)
- **Supabase** = Database service (stores data)
- **Environment Variable** = Secret configuration value
- **Terminal** = Command-line interface (text-based control)
- **localhost** = Your own computer (for testing)
- **Port 3000** = Where the website runs locally

---

**Welcome to web development! 🎊**

