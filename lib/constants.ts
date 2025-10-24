/**
 * Application Constants
 * Centralized location for all static values
 */

// Game Types
export const GAME_TYPES = {
  FOXJUMP: 'foxjump',
} as const;

// Wallet Address Types
export const ADDRESS_TYPES = {
  NATIVE_SEGWIT: 'native_segwit',
  NESTED_SEGWIT: 'nested_segwit',
  TAPROOT: 'taproot',
  SPARK: 'spark',
} as const;

// User Roles (for future expansion)
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  USER_PROFILE: '/api/user/profile',
  SCORES: '/api/scores',
  LEADERBOARD: '/api/leaderboard',
  INSCRIPTIONS: '/api/inscriptions',
  SPARK_BALANCE: '/api/spark/balance',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  GATE_PASSED: 'os_gate_passed',
  LAST_GATE_TIME: 'lastGateTime',
  XVERSE_ADDRESS: 'xverse_address',
  XVERSE_ORDINALS: 'xverse_ordinals_address',
  XVERSE_SPARK: 'xverse_spark_address',
  THEME: 'theme',
  SOUND_ENABLED: 'sound_enabled',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  STRATEGY: '/strategy',
  FOXJUMP: '/foxjump',
} as const;

// Validation Rules
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  USERNAME_REGEX: /^[a-zA-Z0-9_-]+$/,
  BTC_ADDRESS_MIN_LENGTH: 26,
  BTC_ADDRESS_MAX_LENGTH: 90,
} as const;

// Bitcoin/Ordinals Constants
export const BITCOIN = {
  SATOSHIS_PER_BTC: 100000000,
  BLOCK_TIME: 600, // seconds (average)
  GENESIS_DATE: '2009-01-03',
  GENESIS_MESSAGE: 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks',
} as const;

// Game Score Constants
export const SCORE = {
  COIN_VALUE: 10,
  ORDINAL_BONUS: 50,
  LEVEL_MULTIPLIER: 1.5,
  MIN_SCORE: 0,
  MAX_SCORE: 999999999,
} as const;

// Leaderboard Constants
export const LEADERBOARD = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  SORT_OPTIONS: {
    HIGH_SCORE: 'highScore',
    GAMES_PLAYED: 'gamesPlayed',
    AVG_SCORE: 'avgScore',
  },
} as const;

// Inscription View Modes
export const INSCRIPTION_VIEW_MODES = {
  GRID_SMALL: 'grid-small',
  GRID_LARGE: 'grid-large',
  LIST: 'list',
} as const;

// Inscription Sort Orders
export const INSCRIPTION_SORT = {
  HIGH_TO_LOW: 'high-to-low',
  LOW_TO_HIGH: 'low-to-high',
  RECENT_FIRST: 'recent-first',
  OLDEST_FIRST: 'oldest-first',
} as const;

// Profile Tabs
export const PROFILE_TABS = {
  PROFILE: 'profile',
  ADDRESSES: 'addresses',
  GAMES: 'games',
  LEADERBOARD: 'leaderboard',
  INSCRIPTIONS: 'inscriptions',
} as const;

// Animation Durations (milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  SPARK_DISPLAY: 2500,
  NOTIFICATION: 3000,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  INVALID_ADDRESS: 'Invalid Bitcoin address',
  NETWORK_ERROR: 'Network error. Please try again.',
  DATABASE_ERROR: 'Database error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'Resource not found',
  USERNAME_TAKEN: 'Username already taken',
  INVALID_USERNAME: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: '✓ Profile updated successfully!',
  SCORE_SAVED: '✓ Score saved!',
  WALLET_CONNECTED: '✓ Wallet connected!',
  COPIED_TO_CLIPBOARD: '✓ Copied to clipboard',
} as const;

// Content Types
export const CONTENT_TYPES = {
  IMAGE: 'image/',
  VIDEO: 'video/',
  AUDIO: 'audio/',
  HTML: 'text/html',
  TEXT: 'text/',
  JSON: 'application/json',
} as const;

// Inscription APIs (for multi-source fetching)
export const INSCRIPTION_APIS = {
  ORDISCAN: 'ordiscan',
  HIRO: 'hiro',
  UNISAT: 'unisat',
  OKX: 'okx',
} as const;

// Matrix Animation Settings
export const MATRIX = {
  FONT_SIZE: 14,
  DROP_SPEED: 1,
  FADE_OPACITY: 0.12,
  HIGHLIGHT_CHANCE: 0.06,
  RESET_CHANCE: 0.975,
} as const;

// External Links
export const EXTERNAL_LINKS = {
  XVERSE_DOWNLOAD_IOS: 'https://apps.apple.com/app/xverse-wallet/id1552205925',
  XVERSE_DOWNLOAD_ANDROID: 'https://play.google.com/store/apps/details?id=com.secretkeylabs.xverse',
  XVERSE_WEBSITE: 'https://www.xverse.app/',
  BITCOIN_ORG: 'https://bitcoin.org',
  ORDINALS_COM: 'https://ordinals.com',
  MEMPOOL_SPACE: 'https://mempool.space',
  SPARK_DOCS: 'https://docs.sparkl2.com/',
} as const;

// Type exports
export type GameType = typeof GAME_TYPES[keyof typeof GAME_TYPES];
export type AddressType = typeof ADDRESS_TYPES[keyof typeof ADDRESS_TYPES];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type ProfileTab = typeof PROFILE_TABS[keyof typeof PROFILE_TABS];
export type InscriptionViewMode = typeof INSCRIPTION_VIEW_MODES[keyof typeof INSCRIPTION_VIEW_MODES];
export type InscriptionSort = typeof INSCRIPTION_SORT[keyof typeof INSCRIPTION_SORT];
export type LeaderboardSort = typeof LEADERBOARD['SORT_OPTIONS'][keyof typeof LEADERBOARD['SORT_OPTIONS']];

