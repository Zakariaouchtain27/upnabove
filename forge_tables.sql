-- 1. forge_challenges table
CREATE TABLE forge_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT CHECK (challenge_type IN ('design', 'code', 'strategy', 'writing', 'data', 'video')) NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('junior', 'mid', 'senior')) NOT NULL,
    time_limit_minutes INT NOT NULL,
    prize_description TEXT NOT NULL,
    prize_value INT,
    max_participants INT DEFAULT 100,
    drop_time TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'live', 'judging', 'completed', 'cancelled')) NOT NULL,
    is_sponsored BOOLEAN DEFAULT false,
    sponsor_name TEXT,
    entry_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. forge_squads table (needs to be created before forge_entries and forge_squad_members)
CREATE TABLE forge_squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    leader_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    member_ids UUID[] DEFAULT '{}',
    max_size INT DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    streak INT DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. forge_entries table
CREATE TABLE forge_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES forge_challenges(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL, -- anonymous until reveal
    squad_id UUID REFERENCES forge_squads(id) ON DELETE SET NULL,
    codename TEXT NOT NULL,
    submission_text TEXT,
    submission_url TEXT,
    submission_file_url TEXT,
    vote_count INT DEFAULT 0,
    ai_score INT CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_feedback TEXT,
    rank INT,
    is_revealed BOOLEAN DEFAULT false,
    revealed_at TIMESTAMP WITH TIME ZONE,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('submitted', 'scored', 'revealed', 'hired')) NOT NULL,
    UNIQUE (challenge_id, codename)
);

-- 4. forge_squad_members table
CREATE TABLE forge_squad_members (
    squad_id UUID REFERENCES forge_squads(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('leader', 'member')) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (squad_id, candidate_id)
);

-- 5. forge_votes table
CREATE TABLE forge_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES forge_entries(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES candidates(id) ON DELETE SET NULL, -- allow anonymous votes
    voter_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (entry_id, voter_ip)
);

-- 6. forge_badges table
CREATE TABLE forge_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    badge_type TEXT CHECK (badge_type IN ('streak_7', 'streak_30', 'first_win', 'top_3', 'hired', 'squad_leader', 'sponsored_winner')) NOT NULL,
    challenge_id UUID REFERENCES forge_challenges(id) ON DELETE SET NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forge_challenges_status ON forge_challenges(status);
CREATE INDEX idx_forge_challenges_drop_time ON forge_challenges(drop_time);
CREATE INDEX idx_forge_entries_challenge_id ON forge_entries(challenge_id);
CREATE INDEX idx_forge_entries_vote_count ON forge_entries(vote_count DESC);
CREATE INDEX idx_forge_votes_entry_id ON forge_votes(entry_id);
