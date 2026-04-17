-- alter_candidates.sql
-- Add country and skills to candidates table for Leaderboard multi-filtering

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
