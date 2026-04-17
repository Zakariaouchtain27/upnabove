-- alter_forge_entries_scores.sql
-- Run this directly in your Supabase SQL Editor to append required tracking columns.

ALTER TABLE forge_entries ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;
ALTER TABLE forge_entries ADD COLUMN IF NOT EXISTS vote_score NUMERIC DEFAULT 0;
ALTER TABLE forge_entries ADD COLUMN IF NOT EXISTS final_score NUMERIC DEFAULT 0;
