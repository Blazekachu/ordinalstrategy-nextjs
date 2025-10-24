# 🔐 Environment Setup Guide

## Quick Start

Create a `.env.local` file in the root directory with the following content:

```bash
# =============================================================================
# SUPABASE DATABASE (REQUIRED)
# =============================================================================
SUPABASE_URL=***REMOVED***
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# =============================================================================
# PRIVY AUTHENTICATION (OPTIONAL - for Twitter/Email login)
# =============================================================================
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
PRIVY_APP_SECRET=your_privy_secret_here

# =============================================================================
# API KEYS (OPTIONAL - for inscription data)
# =============================================================================
ORDISCAN_API_KEY=***REMOVED***
HIRO_API_KEY=***REMOVED***
UNISAT_API_KEY=***REMOVED***
OKX_ACCESS_KEY=***REMOVED***

# =============================================================================
# APPLICATION SETTINGS
# =============================================================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=false
```

## Step-by-Step Setup

### 1. Supabase Setup (REQUIRED) ⚡

**Get Your Keys:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/vpegbzewydtivvnufsjs/settings/api)
2. Find the "Project API keys" section
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (keep this secret!)

**Initialize Database:**
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/vpegbzewydtivvnufsjs/sql/new)
2. Copy the entire contents of `supabase_schema.sql`
3. Paste and run it
4. Verify tables were created

### 2. Privy Setup (OPTIONAL) 🔑

**Only needed if you want Twitter/Email authentication** (Xverse wallet works without this)

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create a new app or select existing
3. Copy:
   - **App ID** → `NEXT_PUBLIC_PRIVY_APP_ID`
   - **App Secret** → `PRIVY_APP_SECRET`
4. In Privy settings, add allowed domains:
   - `localhost:3000` (development)
   - Your production domain (e.g., `ordinalstrategy.fun`)

### 3. Test Your Setup ✅

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```

**Verify it works:**
- ✅ Page loads without errors
- ✅ You can connect Xverse wallet
- ✅ Profile page shows your wallet info
- ✅ Game scores save properly

## Troubleshooting

### "Supabase client not configured"
- Check that all three Supabase env vars are set
- Restart dev server after changing `.env.local`
- Verify keys have no extra spaces or quotes

### "Privy is not defined"
- Privy env vars must start with `NEXT_PUBLIC_` for the App ID
- Restart dev server after adding env vars
- If not using Privy, leave these blank (app will work with wallet only)

### "Cannot connect to database"
- Verify Supabase project is active
- Check that SQL schema was run successfully
- Test connection in Supabase dashboard

### Environment variables not updating
```bash
# Stop dev server (Ctrl+C)
# Delete Next.js cache
rm -rf .next
# Restart
npm run dev
```

## Security Notes 🔒

- **NEVER** commit `.env.local` to git
- Keep `SUPABASE_SERVICE_KEY` secret (full database access)
- Keep `PRIVY_APP_SECRET` secret
- Only share public keys (those starting with `NEXT_PUBLIC_`)

## Production Deployment

When deploying to Vercel/Netlify:
1. Add all env vars in the hosting dashboard
2. Don't include `.env.local` in deployment
3. Update `NEXT_PUBLIC_SITE_URL` to your domain
4. Add production domain to Privy allowed domains

## Need Help?

- Supabase: https://supabase.com/docs
- Privy: https://docs.privy.io
- Project Issues: Check README.md

