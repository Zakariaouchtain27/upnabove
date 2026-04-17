-- ==========================================
-- SQUADS SYSTEM DB MIGRATION
-- Adds the necessary columns to enable Candidates
-- to form multiplayer teams and send pending invites.
-- ==========================================

-- 1. Add Tagline to Squad Profile
ALTER TABLE forge_squads
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- 2. Expand Members table into an Invitation System
-- 'status' dictates if the user confirmed the leader's email invite.
ALTER TABLE forge_squad_members
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'accepted')) DEFAULT 'accepted';
