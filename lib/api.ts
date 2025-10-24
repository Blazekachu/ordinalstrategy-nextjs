/**
 * API Client
 * Centralized API calls with error handling
 */

import { API_ENDPOINTS } from './constants';

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserProfile {
  privyId: string;
  username?: string;
  profilePic?: string;
  twitterHandle?: string;
  walletAddress?: string;
  nativeSegwitAddress?: string;
  taprootAddress?: string;
  sparkAddress?: string;
  totalScore: number;
  gamesPlayed: number;
  highScore: number;
  inscriptionCount: number;
}

export interface GameScore {
  _id: string;
  score: number;
  level: number;
  coinsCollected: number;
  playTime: number;
  createdAt: string;
  gameName?: string;
}

export interface LeaderboardEntry {
  walletAddress: string;
  displayName: string;
  gamesPlayed: number;
  highScore: number;
  totalScore: number;
  avgScore: number;
  inscriptionCount?: number;
}

// ============================================================================
// Error Handling
// ============================================================================

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleApiError(error: any): never {
  if (error instanceof ApiError) throw error;
  
  if (error.response) {
    throw new ApiError(
      error.response.data?.error || 'API request failed',
      error.response.status
    );
  }
  
  if (error.request) {
    throw new ApiError('Network error. Please check your connection.');
  }
  
  throw new ApiError(error.message || 'An unknown error occurred');
}

// ============================================================================
// Fetch Wrapper
// ============================================================================

async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status
      );
    }

    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================================================
// User API
// ============================================================================

export const userApi = {
  /**
   * Get user profile by wallet address
   */
  async getProfile(walletAddress: string): Promise<UserProfile> {
    const data = await apiFetch<{ user: UserProfile }>(
      `${API_ENDPOINTS.USER_PROFILE}?walletAddress=${walletAddress}`
    );
    return data.user;
  },

  /**
   * Update user profile
   */
  async updateProfile(
    walletAddress: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const data = await apiFetch<{ user: UserProfile }>(
      API_ENDPOINTS.USER_PROFILE,
      {
        method: 'PUT',
        body: JSON.stringify({
          walletAddress,
          ...updates,
        }),
      }
    );
    return data.user;
  },
};

// ============================================================================
// Scores API
// ============================================================================

export const scoresApi = {
  /**
   * Submit a new game score
   */
  async submitScore(
    privyId: string,
    gameName: string,
    score: number,
    level: number,
    coinsCollected: number,
    playTime: number
  ): Promise<GameScore> {
    const data = await apiFetch<{ gameScore: GameScore }>(
      API_ENDPOINTS.SCORES,
      {
        method: 'POST',
        body: JSON.stringify({
          privyId,
          gameName,
          score,
          level,
          coinsCollected,
          playTime,
        }),
      }
    );
    return data.gameScore;
  },

  /**
   * Get user scores
   */
  async getUserScores(
    walletAddress: string,
    gameName = 'foxjump',
    limit = 20
  ): Promise<GameScore[]> {
    const data = await apiFetch<{ scores: GameScore[] }>(
      `${API_ENDPOINTS.SCORES}?walletAddress=${walletAddress}&type=user&gameName=${gameName}&limit=${limit}`
    );
    return data.scores || [];
  },

  /**
   * Get leaderboard scores
   */
  async getLeaderboard(
    gameName = 'foxjump',
    limit = 10
  ): Promise<GameScore[]> {
    const data = await apiFetch<{ scores: GameScore[] }>(
      `${API_ENDPOINTS.SCORES}?type=leaderboard&gameName=${gameName}&limit=${limit}`
    );
    return data.scores || [];
  },
};

// ============================================================================
// Leaderboard API
// ============================================================================

export const leaderboardApi = {
  /**
   * Get global leaderboard
   */
  async getLeaderboard(
    sortBy: 'highScore' | 'gamesPlayed' | 'avgScore' = 'highScore',
    limit = 100
  ): Promise<LeaderboardEntry[]> {
    const data = await apiFetch<{ leaderboard: LeaderboardEntry[] }>(
      `${API_ENDPOINTS.LEADERBOARD}?sortBy=${sortBy}&limit=${limit}`
    );
    return data.leaderboard || [];
  },
};

// ============================================================================
// Spark API
// ============================================================================

export const sparkApi = {
  /**
   * Get Spark balance for address
   */
  async getBalance(address: string): Promise<number | null> {
    try {
      const data = await apiFetch<{ balance: number }>(
        `${API_ENDPOINTS.SPARK_BALANCE}?address=${address}`
      );
      return data.balance / 100000000; // Convert satoshis to BTC
    } catch (error) {
      console.error('Error fetching Spark balance:', error);
      return null;
    }
  },
};

// ============================================================================
// Bitcoin/Mempool API
// ============================================================================

export const bitcoinApi = {
  /**
   * Get current Bitcoin price from CoinGecko
   */
  async getPrice(): Promise<{
    price: number;
    change7d: number;
    change30d: number;
  } | null> {
    try {
      const data = await fetch(
        'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true'
      ).then((r) => r.json());

      return {
        price: data?.market_data?.current_price?.usd || 0,
        change7d: data?.market_data?.price_change_percentage_7d_in_currency?.usd || 0,
        change30d: data?.market_data?.price_change_percentage_30d_in_currency?.usd || 0,
      };
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      return null;
    }
  },

  /**
   * Get mempool stats from mempool.space
   */
  async getMempoolStats(): Promise<{
    blockHeight: number;
    mempoolCount: number;
    fastestFee: number;
  } | null> {
    try {
      const [blocks, mempool, fees] = await Promise.all([
        fetch('https://mempool.space/api/blocks').then((r) => r.json()),
        fetch('https://mempool.space/api/mempool').then((r) => r.json()),
        fetch('https://mempool.space/api/v1/fees/recommended').then((r) => r.json()),
      ]);

      return {
        blockHeight: blocks?.[0]?.height || 0,
        mempoolCount: mempool?.count || 0,
        fastestFee: fees?.fastestFee || 0,
      };
    } catch (error) {
      console.error('Error fetching mempool stats:', error);
      return null;
    }
  },

  /**
   * Get Bitcoin address balance
   */
  async getAddressBalance(address: string): Promise<number | null> {
    try {
      const data = await fetch(
        `https://mempool.space/api/address/${address}`
      ).then((r) => r.json());

      const balanceInSats =
        data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      return balanceInSats / 100000000; // Convert to BTC
    } catch (error) {
      console.error('Error fetching address balance:', error);
      return null;
    }
  },
};

// ============================================================================
// Ordinals API
// ============================================================================

export const ordinalsApi = {
  /**
   * Get latest inscription number
   */
  async getLatestInscription(): Promise<number | null> {
    try {
      // Try ordinals.com first
      const data = await fetch('https://ordinals.com/api/inscriptions')
        .then((r) => r.json())
        .catch(() => null);

      if (data?.inscriptions?.[0]?.number !== undefined) {
        return data.inscriptions[0].number;
      }

      // Fallback to Hiro API
      const hiroData = await fetch(
        'https://api.hiro.so/ordinals/v1/inscriptions?limit=1'
      )
        .then((r) => r.json())
        .catch(() => null);

      return hiroData?.results?.[0]?.number || null;
    } catch (error) {
      console.error('Error fetching latest inscription:', error);
      return null;
    }
  },
};

// ============================================================================
// Export all APIs
// ============================================================================

export const api = {
  user: userApi,
  scores: scoresApi,
  leaderboard: leaderboardApi,
  spark: sparkApi,
  bitcoin: bitcoinApi,
  ordinals: ordinalsApi,
};

export default api;

