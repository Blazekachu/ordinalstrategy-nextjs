-- Supabase Schema for Ordinal Strategy
-- Run this in Supabase SQL Editor: ***REMOVED***

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  email TEXT,
  twitter_handle TEXT,
  twitter_id TEXT,
  profile_pic TEXT,
  privy_id TEXT UNIQUE,
  wallet_address TEXT,
  native_segwit_address TEXT,
  taproot_address TEXT,
  spark_address TEXT,
  games_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  inscription_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game Scores Table
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  level INTEGER DEFAULT 1,
  coins_collected INTEGER DEFAULT 0,
  play_time INTEGER DEFAULT 0,
  game_type TEXT DEFAULT 'foxjump',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- Policies (allow public read access, authenticated writes)
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

CREATE POLICY "Game scores are viewable by everyone" ON game_scores
  FOR SELECT USING (true);

-- For API operations, we'll use the service key, so these policies allow all operations
CREATE POLICY "Enable all operations for service role" ON users
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for service role" ON game_scores
  USING (true) WITH CHECK (true);

