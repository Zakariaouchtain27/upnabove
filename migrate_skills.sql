-- 1. Create the new tables
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_skills (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (candidate_id, skill_id)
);

-- 2. Extract unique skills and insert them into the skills table
-- Unnest the skills array from candidates and insert unique values
INSERT INTO skills (name)
SELECT DISTINCT unnest(skills) AS skill_name
FROM candidates
WHERE skills IS NOT NULL AND array_length(skills, 1) > 0
ON CONFLICT (name) DO NOTHING;

-- 3. Populate candidate_skills join table
-- Join candidates with skills based on the unnested value
INSERT INTO candidate_skills (candidate_id, skill_id)
SELECT c.id, s.id
FROM candidates c
CROSS JOIN unnest(c.skills) AS skill_name
JOIN skills s ON s.name = skill_name
ON CONFLICT (candidate_id, skill_id) DO NOTHING;

-- 4. Drop the old skills column from candidates
ALTER TABLE candidates DROP COLUMN IF EXISTS skills;
