# 👨‍💻 Developer Guide

**For developers working on Ordinal Strategy**

This guide explains the codebase structure, patterns, and best practices for contributing to this project.

---

## 📚 Table of Contents

1. [Codebase Structure](#-codebase-structure)
2. [Key Concepts](#-key-concepts)
3. [Development Workflow](#-development-workflow)
4. [Code Patterns](#-code-patterns)
5. [API Integration](#-api-integration)
6. [State Management](#-state-management)
7. [Styling Guide](#-styling-guide)
8. [Testing](#-testing)
9. [Performance](#-performance)
10. [Common Tasks](#-common-tasks)

---

## 🏗️ Codebase Structure

### Core Directories

```
lib/              # Core utilities & configuration
├── config.ts     # App configuration (centralized)
├── constants.ts  # All constants and enums
├── utils.ts      # Helper functions
├── api.ts        # API client (typed, centralized)
└── supabase.ts   # Database client

app/              # Next.js App Router
├── api/         # Backend API routes
├── [page]/      # Frontend pages
└── globals.css  # Global styles

components/       # Reusable React components
```

### Design Principles

1. **Centralization** - Config, constants, and utilities are centralized
2. **Type Safety** - TypeScript everywhere
3. **DRY** - Don't Repeat Yourself (use utilities)
4. **Separation** - Business logic separate from UI
5. **Performance** - Lazy loading, memoization, efficient queries

---

## 🧠 Key Concepts

### 1. Configuration Management

**DO:** Use centralized config
```typescript
import config from '@/lib/config';

// ✅ Good
const apiUrl = config.apis.mempool;
const primaryColor = config.colors.primary;
```

**DON'T:** Hardcode values
```typescript
// ❌ Bad
const apiUrl = 'https://mempool.space/api';
const primaryColor = '#f7931a';
```

### 2. Constants Over Magic Values

**DO:** Use named constants
```typescript
import { STORAGE_KEYS, ROUTES } from '@/lib/constants';

// ✅ Good
localStorage.setItem(STORAGE_KEYS.GATE_PASSED, '1');
router.push(ROUTES.PROFILE);
```

**DON'T:** Use magic strings
```typescript
// ❌ Bad
localStorage.setItem('os_gate_passed', '1');
router.push('/profile');
```

### 3. Utility Functions

**DO:** Use provided utilities
```typescript
import { formatNumber, truncateAddress, copyToClipboard } from '@/lib/utils';

// ✅ Good
const formatted = formatNumber(1234567); // '1,234,567'
const short = truncateAddress(address, 8, 8);
await copyToClipboard(text);
```

**DON'T:** Reimplement
```typescript
// ❌ Bad
const formatted = num.toLocaleString(); // Use formatNumber()
const short = addr.slice(0, 8) + '...' + addr.slice(-8); // Use truncateAddress()
```

### 4. API Calls

**DO:** Use typed API client
```typescript
import { api } from '@/lib/api';

// ✅ Good
const profile = await api.user.getProfile(address);
const scores = await api.scores.getUserScores(address);
```

**DON'T:** Use raw fetch
```typescript
// ❌ Bad
const response = await fetch(`/api/user/profile?walletAddress=${address}`);
const data = await response.json();
```

---

## 🔄 Development Workflow

### 1. Setting Up Development Environment

```bash
# Install dependencies
npm install

# Set up environment
cp ENV_SETUP.md .env.local
# Fill in your Supabase keys

# Run development server
npm run dev
```

### 2. Making Changes

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, test locally
npm run dev

# Build to check for errors
npm run build

# Commit changes
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
```

### 3. Before Committing

✅ **Checklist:**
- [ ] Code follows project patterns
- [ ] No hardcoded values (use config/constants)
- [ ] TypeScript has no errors
- [ ] Tested in browser
- [ ] No console errors
- [ ] Mobile-responsive (if UI change)

---

## 🎨 Code Patterns

### Component Structure

```typescript
'use client';

import { useState, useEffect } from 'react';
import { CONSTANTS } from '@/lib/constants';
import { utilFunction } from '@/lib/utils';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export default function Component({ prop1, prop2 = 0 }: ComponentProps) {
  // 1. State
  const [state, setState] = useState<string>('');

  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 3. Handlers
  const handleClick = () => {
    // Handler logic
  };

  // 4. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');

    if (!param) {
      return NextResponse.json(
        { error: 'Missing required parameter' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('table')
      .select('*')
      .eq('field', param);

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🔌 API Integration

### User Profile

```typescript
import { api } from '@/lib/api';

// Get profile
const profile = await api.user.getProfile(walletAddress);

// Update profile
const updated = await api.user.updateProfile(walletAddress, {
  username: 'newname',
  profilePic: 'https://...',
});
```

### Game Scores

```typescript
// Submit score
await api.scores.submitScore(
  walletAddress,
  'foxjump',
  score,
  level,
  coins,
  playTime
);

// Get user scores
const scores = await api.scores.getUserScores(walletAddress);

// Get leaderboard
const leaderboard = await api.scores.getLeaderboard('foxjump', 10);
```

### Bitcoin Data

```typescript
// Get BTC price
const price = await api.bitcoin.getPrice();

// Get mempool stats
const stats = await api.bitcoin.getMempoolStats();

// Get address balance
const balance = await api.bitcoin.getAddressBalance(address);
```

---

## 🎯 State Management

### Local State (useState)

For component-specific state:

```typescript
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

### Context (React Context)

For app-wide state:

```typescript
// XverseWalletProvider already provides:
const {
  connected,
  address,
  balance,
  connect,
  disconnect,
} = useXverseWallet();
```

### Local Storage

Use utilities for safe localStorage access:

```typescript
import { getLocalStorage, setLocalStorage } from '@/lib/utils';
import { STORAGE_KEYS } from '@/lib/constants';

// Get
const value = getLocalStorage(STORAGE_KEYS.GATE_PASSED, false);

// Set
setLocalStorage(STORAGE_KEYS.GATE_PASSED, true);
```

---

## 🎨 Styling Guide

### Tailwind CSS

We use Tailwind CSS v4. Follow these patterns:

```typescript
// ✅ Good - Responsive, semantic
<div className="bg-[#0b0c10] text-white px-4 md:px-8 rounded-lg">

// ❌ Bad - Not responsive
<div className="bg-[#0b0c10] text-white px-8 rounded-lg">
```

### Colors

Use theme colors from config:

```typescript
import config from '@/lib/config';

// Primary: #f7931a (Bitcoin Orange)
// Secondary: #ffd166 (Light Orange)
// Background: #0b0c10 (Dark)
// Text: #ffffff (White)

// In Tailwind:
<div className="bg-[#f7931a] text-[#0b0c10]">
```

### Animations

```typescript
// Smooth transitions
<div className="transition-all duration-300 hover:scale-105">

// Loading spinner
<div className="w-12 h-12 border-4 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
```

---

## 🧪 Testing

### Manual Testing Checklist

**For Every Change:**
- [ ] Test on Chrome/Firefox/Safari
- [ ] Test mobile view (responsive)
- [ ] Test with wallet connected/disconnected
- [ ] Check console for errors
- [ ] Test loading states
- [ ] Test error states

**For New Features:**
- [ ] Write test scenarios
- [ ] Test edge cases
- [ ] Test with real data
- [ ] Test performance

### Browser Console Testing

```javascript
// Check config
import config from '@/lib/config';
console.log(config);

// Check constants
import { ROUTES } from '@/lib/constants';
console.log(ROUTES);

// Test API
import { api } from '@/lib/api';
const data = await api.user.getProfile('address');
console.log(data);
```

---

## ⚡ Performance

### Best Practices

**1. Lazy Loading**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

**2. Memoization**
```typescript
import { useMemo, useCallback } from 'react';

// Expensive calculations
const computed = useMemo(() => {
  return expensiveOperation(data);
}, [data]);

// Callbacks
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

**3. Efficient Queries**
```typescript
// ✅ Good - Only fetch what you need
const { data } = await supabase
  .from('users')
  .select('id, username, high_score')
  .eq('id', userId)
  .single();

// ❌ Bad - Fetches everything
const { data } = await supabase
  .from('users')
  .select('*');
```

---

## 🔧 Common Tasks

### Adding a New Page

1. Create file in `app/`:
```typescript
// app/newpage/page.tsx
'use client';

export default function NewPage() {
  return <div>New Page</div>;
}
```

2. Add route to constants:
```typescript
// lib/constants.ts
export const ROUTES = {
  // ...
  NEW_PAGE: '/newpage',
} as const;
```

### Adding a New API Endpoint

1. Create route file:
```typescript
// app/api/newroute/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Implementation
}
```

2. Add to API client:
```typescript
// lib/api.ts
export const myApi = {
  async getData() {
    return await apiFetch('/api/newroute');
  },
};
```

### Adding a New Component

1. Create component file:
```typescript
// components/MyComponent.tsx
'use client';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return <div>{title}</div>;
}
```

2. Use component:
```typescript
import MyComponent from '@/components/MyComponent';

<MyComponent title="Hello" />
```

### Adding Configuration

```typescript
// lib/config.ts
export const config = {
  // Add new config section
  myFeature: {
    enabled: process.env.NEXT_PUBLIC_MY_FEATURE === 'true',
    apiUrl: process.env.MY_API_URL || '',
  },
};
```

---

## 📦 Building for Production

```bash
# Build
npm run build

# Check for errors
# Fix any TypeScript or build errors

# Test production build locally
npm run start

# Deploy
git push origin main
# Vercel will auto-deploy
```

---

## 🐛 Debugging

### Common Issues

**Build Errors:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Type Errors:**
```bash
# Check TypeScript
npx tsc --noEmit
```

**Runtime Errors:**
- Check browser console (F12)
- Check server logs in terminal
- Use `console.log` for debugging
- Use React DevTools

---

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **TypeScript Docs:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Supabase Docs:** https://supabase.com/docs

---

## 🤝 Contributing

1. Follow the code patterns in this guide
2. Write clean, readable code
3. Comment complex logic
4. Test thoroughly
5. Submit PR with clear description

---

**Happy Coding! 🚀**

