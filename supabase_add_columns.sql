-- Add missing columns to game_scores table
-- Run this in Supabase SQL Editor

ALTER TABLE game_scores 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS coins_collected INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS play_time INTEGER DEFAULT 0;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'game_scores';

