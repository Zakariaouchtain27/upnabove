DO $$
DECLARE
    con_name text;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'forge_badges'::regclass
      AND contype = 'c'; -- check constraint

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE forge_badges DROP CONSTRAINT ' || con_name;
    END IF;
END $$;

-- Now add the expanded constraint
ALTER TABLE forge_badges
ADD CONSTRAINT forge_badges_badge_type_check CHECK (
    badge_type IN (
        -- Streak
        'streak_7', 'streak_14', 'streak_30', 'streak_100',
        -- Performance
        'first_blood', 'champion', 'top_3', 'perfect_score', 'peoples_choice',
        -- Social
        'squad_leader', 'team_player', 'recruiter', 'global_citizen',
        -- Special
        'hired', 'sponsored_champion', 'pioneer', 'ghost_hunter'
    )
);
