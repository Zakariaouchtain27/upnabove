-- Comments for top-3 revealed entries on completed challenges
CREATE TABLE forge_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES forge_entries(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_forge_comments_entry_id ON forge_comments(entry_id);

-- Upvote/downvote tracking (one vote per user per comment)
CREATE TABLE forge_comment_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID REFERENCES forge_comments(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    vote INT CHECK (vote IN (1, -1)) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (comment_id, candidate_id)
);

-- Emoji reactions during live window (aggregated, one per user per entry per type)
CREATE TABLE forge_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES forge_entries(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
    voter_ip TEXT NOT NULL,
    reaction_type TEXT CHECK (reaction_type IN ('fire', 'eyes', 'impressed', 'good_luck')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (entry_id, voter_ip, reaction_type)
);

CREATE INDEX idx_forge_reactions_entry_id ON forge_reactions(entry_id);

-- RLS policies
ALTER TABLE forge_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are publicly readable" ON forge_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON forge_comments FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Authors can delete own comments" ON forge_comments FOR DELETE USING (auth.uid() = candidate_id);

CREATE POLICY "Comment votes publicly readable" ON forge_comment_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote on comments" ON forge_comment_votes FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Users can change their vote" ON forge_comment_votes FOR UPDATE USING (auth.uid() = candidate_id);
CREATE POLICY "Users can remove their vote" ON forge_comment_votes FOR DELETE USING (auth.uid() = candidate_id);

CREATE POLICY "Reactions are publicly readable" ON forge_reactions FOR SELECT USING (true);
CREATE POLICY "Anyone can react" ON forge_reactions FOR INSERT WITH CHECK (true);
