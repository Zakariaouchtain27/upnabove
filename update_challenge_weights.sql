-- 1. Add new columns to forge_challenges
ALTER TABLE forge_challenges 
ADD COLUMN vote_weight NUMERIC DEFAULT 0.4,
ADD COLUMN ai_weight NUMERIC DEFAULT 0.6;

-- 2. Update calculate_final_rankings to use the dynamic weights
CREATE OR REPLACE FUNCTION calculate_final_rankings(p_challenge_id UUID)
RETURNS SETOF forge_entries AS $$
DECLARE
    v_vote_weight NUMERIC;
    v_ai_weight NUMERIC;
BEGIN
    -- Fetch the weights for this challenge
    SELECT vote_weight, ai_weight INTO v_vote_weight, v_ai_weight
    FROM forge_challenges
    WHERE id = p_challenge_id;

    -- Update ranks directly based on the dynamic scoring formula
    WITH ranked_entries AS (
        SELECT id, 
               ROW_NUMBER() OVER (ORDER BY (COALESCE(vote_count, 0) * v_vote_weight + COALESCE(ai_score, 0) * v_ai_weight) DESC) as new_rank
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

-- 3. Update reveal_top_entries to use the dynamic weights for consistent sorting
CREATE OR REPLACE FUNCTION reveal_top_entries(p_challenge_id UUID, p_top_n INT)
RETURNS SETOF forge_entries AS $$
DECLARE
    entry_ids UUID[];
    v_vote_weight NUMERIC;
    v_ai_weight NUMERIC;
BEGIN
    -- Fetch the weights for this challenge
    SELECT vote_weight, ai_weight INTO v_vote_weight, v_ai_weight
    FROM forge_challenges
    WHERE id = p_challenge_id;

    -- Select the IDs of the top N entries (relying on the rank calculation we just performed)
    SELECT array_agg(id) INTO entry_ids
    FROM (
        SELECT id
        FROM forge_entries
        WHERE challenge_id = p_challenge_id
        ORDER BY (COALESCE(vote_count, 0) * v_vote_weight + COALESCE(ai_score, 0) * v_ai_weight) DESC
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
    ORDER BY (COALESCE(vote_count, 0) * v_vote_weight + COALESCE(ai_score, 0) * v_ai_weight) DESC;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
