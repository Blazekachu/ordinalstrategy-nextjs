-- Reset game stats for blazekachu
-- Run this in Supabase SQL Editor

-- Option 1: Reset stats for specific user (by username)
UPDATE users 
SET 
  games_played = 0,
  total_score = 0,
  high_score = 0
WHERE username = 'blazekachu';

-- Option 2: Reset ALL users' stats (use with caution!)
-- UPDATE users 
-- SET 
--   games_played = 0,
--   total_score = 0,
--   high_score = 0;

-- Option 3: Delete all game scores for specific user
-- DELETE FROM game_scores 
-- WHERE user_id = (SELECT id FROM users WHERE username = 'blazekachu');

-- Verify the reset
SELECT username, games_played, total_score, high_score 
FROM users 
WHERE username = 'blazekachu';

