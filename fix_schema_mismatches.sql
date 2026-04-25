-- 1. Add missing columns to existing tables
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE forge_entries ADD COLUMN IF NOT EXISTS fraud_score INT DEFAULT 0;
ALTER TABLE forge_squad_members ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE forge_squads ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE forge_challenges ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create missing tables
CREATE TABLE IF NOT EXISTS forge_scoring_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES forge_entries(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES forge_challenges(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL, -- Optional mapping
    priority INT DEFAULT 0,
    attempts INT DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forge_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create missing RPCs (Database Functions)
-- Increment entry count for a challenge
CREATE OR REPLACE FUNCTION increment_entry_count(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forge_challenges
  SET entry_count = COALESCE(entry_count, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment vote count for an entry
CREATE OR REPLACE FUNCTION increment_vote(row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forge_entries
  SET vote_count = COALESCE(vote_count, 0) + 1
  WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
