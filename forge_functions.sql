-- 1. generate_codename(challenge_id)
-- Returns a unique codename using adjectives and numbers.
CREATE OR REPLACE FUNCTION generate_codename(p_challenge_id UUID)
RETURNS TEXT AS $$
DECLARE
    adjectives TEXT[] := ARRAY['Ghost', 'Phantom', 'Shadow', 'Cipher', 'Nova', 'Storm', 'Blaze', 'Echo', 'Vortex', 'Titan'];
    chosen_adj TEXT;
    random_num TEXT;
    new_codename TEXT;
    is_unique BOOLEAN := false;
    max_attempts INT := 100;
    attempts INT := 0;
BEGIN
    WHILE NOT is_unique AND attempts < max_attempts LOOP
        chosen_adj := adjectives[1 + floor(random() * array_length(adjectives, 1))];
        -- generate 4 digit string, padded
        random_num := to_char(floor(random() * 10000), 'FM0000');
        new_codename := chosen_adj || '#' || random_num;

        -- check uniqueness
        IF NOT EXISTS (
            SELECT 1 FROM forge_entries 
            WHERE challenge_id = p_challenge_id AND codename = new_codename
        ) THEN
            is_unique := true;
        END IF;

        attempts := attempts + 1;
    END LOOP;

    IF NOT is_unique THEN
        RAISE EXCEPTION 'Could not generate a unique codename after % attempts', max_attempts;
    END IF;

    RETURN new_codename;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- 2. calculate_final_rankings(challenge_id)
-- Final rank = (vote_count * 0.4) + (ai_score * 0.6)
-- Updates rank column on all forge_entries for this challenge
CREATE OR REPLACE FUNCTION calculate_final_rankings(p_challenge_id UUID)
RETURNS SETOF forge_entries AS $$
BEGIN
    -- Update ranks directly based on the defined scoring formula
    WITH ranked_entries AS (
        SELECT id, 
               ROW_NUMBER() OVER (ORDER BY (COALESCE(vote_count, 0) * 0.4 + COALESCE(ai_score, 0) * 0.6) DESC) as new_rank
        FROM forge_entries
        WHERE challenge_id = p_challenge_id
    )
    UPDATE forge_entries
    SET rank = r.new_rank
    FROM ranked_entries r
    WHERE forge_entries.id = r.id;

    -- Return the ordered result set
    RETURN QUERY
    SELECT * FROM forge_entries
    WHERE challenge_id = p_challenge_id
    ORDER BY rank ASC;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

-- 3. reveal_top_entries(challenge_id, top_n)
-- Sets is_revealed = true on top N entries and records revealed_at.
-- It returns the affected entry rows. The frontend API can then fetch candidate profiles since they are no longer hidden by is_revealed.
CREATE OR REPLACE FUNCTION reveal_top_entries(p_challenge_id UUID, p_top_n INT)
RETURNS SETOF forge_entries AS $$
DECLARE
    entry_ids UUID[];
BEGIN
    -- Select the IDs of the top N entries (relying on the rank calculation we just performed)
    SELECT array_agg(id) INTO entry_ids
    FROM (
        SELECT id
        FROM forge_entries
        WHERE challenge_id = p_challenge_id
        ORDER BY (COALESCE(vote_count, 0) * 0.4 + COALESCE(ai_score, 0) * 0.6) DESC
        LIMIT p_top_n
    ) sub;

    -- Update those rows to revealed
    UPDATE forge_entries
    SET is_revealed = true,
        revealed_at = NOW()
    WHERE id = ANY(entry_ids);

    -- Return the fully revealed entries
    RETURN QUERY
    SELECT * FROM forge_entries
    WHERE id = ANY(entry_ids)
    ORDER BY (COALESCE(vote_count, 0) * 0.4 + COALESCE(ai_score, 0) * 0.6) DESC;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
