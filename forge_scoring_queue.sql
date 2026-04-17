-- Scoring queue for batch processing high-volume challenges
CREATE TABLE forge_scoring_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES forge_entries(id) ON DELETE CASCADE UNIQUE,
    challenge_id UUID REFERENCES forge_challenges(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'processing', 'done', 'failed')) DEFAULT 'pending',
    priority INT DEFAULT 0,          -- Higher = processed first. Increased for challenges near expiry.
    attempts INT DEFAULT 0,
    error TEXT,
    queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_scoring_queue_status_priority ON forge_scoring_queue (status, priority DESC, queued_at ASC);

-- Add judging_criteria column to forge_challenges if not already present
ALTER TABLE forge_challenges ADD COLUMN IF NOT EXISTS judging_criteria JSONB DEFAULT '[]';
-- Example judging_criteria shape:
-- [
--   { "name": "Problem Solving", "description": "Quality of approach to the challenge", "weight": 40 },
--   { "name": "Code Quality",    "description": "Cleanliness, structure, readability",  "weight": 30 },
--   { "name": "Communication",   "description": "Clarity of explanation",                "weight": 30 }
-- ]

ALTER TABLE forge_challenges ADD COLUMN IF NOT EXISTS prize_description TEXT;

-- RLS
ALTER TABLE forge_scoring_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON forge_scoring_queue USING (auth.role() = 'service_role');
