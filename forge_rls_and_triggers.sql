-- ========== ROW LEVEL SECURITY (RLS) POLICIES ==========

-- 1. Enable RLS on all tables
ALTER TABLE forge_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forge_badges ENABLE ROW LEVEL SECURITY;

-- Note on Service Role:
-- By default, the Supabase 'service_role' automatically bypasses all RLS policies.
-- Therefore, you do not need explicit policies allowing the service_role to insert/update data.
-- It can already update status, entry_count, rank, is_revealed, ai_score, and insert badges.

-- 2. forge_challenges policies
CREATE POLICY "Public can read live/judging/completed challenges"
ON forge_challenges FOR SELECT
USING (status IN ('live', 'judging', 'completed'));

CREATE POLICY "Employers can read their own challenges"
ON forge_challenges FOR SELECT
USING (employer_id = auth.uid());

CREATE POLICY "Employers can update their own challenges"
ON forge_challenges FOR UPDATE
USING (employer_id = auth.uid())
WITH CHECK (employer_id = auth.uid());

-- 3. forge_entries policies
-- Note: RLS filters rows dynamically, not columns. 
-- For the public to read entries but hide the `candidate_id` when `is_revealed=false`,
-- the database-layer best practice is to restrict column SELECT grants or create a Public View.
-- Here, we provide row-level access. You should either handle column filtering in the frontend/API,
-- or create a secure View `public_forge_entries` that masks the `candidate_id` column.
CREATE POLICY "Public can read all entries"
ON forge_entries FOR SELECT
USING (true);

CREATE POLICY "Candidates can insert their own entries"
ON forge_entries FOR INSERT
WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Candidates can update their own entries (if needed)"
ON forge_entries FOR UPDATE
USING (candidate_id = auth.uid())
WITH CHECK (candidate_id = auth.uid());

-- 4. forge_squads policies
CREATE POLICY "Public can read squads"
ON forge_squads FOR SELECT
USING (true);

CREATE POLICY "Squad leader can update squad"
ON forge_squads FOR UPDATE
USING (leader_id = auth.uid())
WITH CHECK (leader_id = auth.uid());

-- 5. forge_squad_members policies
CREATE POLICY "Candidates can read their own memberships"
ON forge_squad_members FOR SELECT
USING (candidate_id = auth.uid());

CREATE POLICY "Squad members can read members of their squad"
ON forge_squad_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM forge_squad_members fsm 
        WHERE fsm.squad_id = forge_squad_members.squad_id 
        AND fsm.candidate_id = auth.uid()
    )
);

CREATE POLICY "Squad leader can insert members"
ON forge_squad_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM forge_squads 
        WHERE id = squad_id AND leader_id = auth.uid()
    )
);

CREATE POLICY "Squad leader can delete members"
ON forge_squad_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM forge_squads 
        WHERE id = squad_id AND leader_id = auth.uid()
    )
);

-- 6. forge_votes policies
-- Allow anonymous IPs to cast votes
CREATE POLICY "Anyone can insert votes"
ON forge_votes FOR INSERT
WITH CHECK (true);

-- No SELECT policy is created for `forge_votes`.
-- This means NO ONE (except service_role) can read individual voter IDs/IPs.
-- The public receives the aggregated count via `forge_entries.vote_count`.

-- 7. forge_badges policies
CREATE POLICY "Public can read all badges"
ON forge_badges FOR SELECT
USING (true);

-- No INSERT/UPDATE/DELETE policies means only the service_role can modify badges.


-- ========== DATABASE TRIGGERS ==========
-- While an Edge Function (e.g. Deno via Webhook) could do this, 
-- standard PostgreSQL Triggers are much faster, atomic, and optimal for simple counter increments in Supabase.

-- Trigger to increment vote_count on forge_entries
CREATE OR REPLACE FUNCTION increment_entry_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forge_entries
    SET vote_count = vote_count + 1
    WHERE id = NEW.entry_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_forge_vote_inserted
AFTER INSERT ON forge_votes
FOR EACH ROW
EXECUTE FUNCTION increment_entry_vote_count();

-- Trigger to increment entry_count on forge_challenges
CREATE OR REPLACE FUNCTION increment_challenge_entry_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE forge_challenges
    SET entry_count = entry_count + 1
    WHERE id = NEW.challenge_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_forge_entry_inserted
AFTER INSERT ON forge_entries
FOR EACH ROW
EXECUTE FUNCTION increment_challenge_entry_count();
