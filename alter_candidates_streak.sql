-- ==========================================
-- CANDIDATE FORGE STREAKS MIGRATION
-- Adds the necessary columns to track individual
-- Solo candidate streaks for the Flame Widget.
-- ==========================================

ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS forge_streak INT DEFAULT 0;

ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS last_forge_entry_at TIMESTAMP WITH TIME ZONE;
