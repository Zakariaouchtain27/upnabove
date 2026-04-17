-- alter_candidates_referrals.sql

-- 1. Add referral tracking to candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS bonus_votes INT DEFAULT 0;

-- 2. Backfill existing candidates with a unique short code
UPDATE candidates 
SET referral_code = 'F-' || upper(substr(md5(random()::text), 1, 6))
WHERE referral_code IS NULL;

-- 3. Ensure future candidates must have it (or we generate on insert via application logic)
-- We will handle generation in application logic.
