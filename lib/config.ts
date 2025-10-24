/**
 * Centralized Configuration
 * All app configuration and environment variables
 */

export const config = {
  // Site Info
  site: {
    name: 'Ordinal Strategy',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    description: 'Precision in Bitcoin Ordinals',
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  // Privy (optional)
  privy: {
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
    appSecret: process.env.PRIVY_APP_SECRET || '',
  },

  // API Keys (optional)
  apiKeys: {
    ordiscan: process.env.ORDISCAN_API_KEY || '***REMOVED***',
    hiro: process.env.HIRO_API_KEY || '***REMOVED***',
    unisat: process.env.UNISAT_API_KEY || '***REMOVED***',
    okx: process.env.OKX_ACCESS_KEY || '***REMOVED***',
  },

  // Feature Flags
  features: {
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
    privy: !!process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    magnifyLens: true,
    matrixBackground: true,
  },

  // App Settings
  app: {
    gateShowInterval: 60 * 60 * 1000, // 1 hour
    defaultGameName: 'foxjump',
    leaderboardLimit: 100,
    scoresLimit: 20,
    inscriptionsFetchLimit: 5000,
  },

  // Bitcoin/Ordinals APIs
  apis: {
    mempool: 'https://mempool.space/api',
    ordinals: 'https://ordinals.com',
    coingecko: 'https://api.coingecko.com/api/v3',
    ordiscan: 'https://api.ordiscan.com/v1',
    hiro: 'https://api.hiro.so/ordinals/v1',
    unisat: 'https://open-api.unisat.io/v1',
    okx: 'https://www.okx.com/api/v5',
  },

  // Theme Colors
  colors: {
    primary: '#f7931a', // Bitcoin Orange
    secondary: '#ffd166', // Light Orange
    background: '#0b0c10', // Dark Background
    text: '#ffffff', // White
    accent: '#36d399', // Green
    error: '#ef4444', // Red
  },
};

// Helper to check if required config is present
export function validateConfig() {
  const errors: string[] = [];

  if (!config.supabase.url) errors.push('SUPABASE_URL is required');
  if (!config.supabase.anonKey) errors.push('SUPABASE_ANON_KEY is required');
  if (!config.supabase.serviceKey) errors.push('SUPABASE_SERVICE_KEY is required');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper to get config value with fallback
export function getConfig<T>(key: string, fallback: T): T {
  try {
    const value = key.split('.').reduce((obj: any, k) => obj?.[k], config);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export default config;

