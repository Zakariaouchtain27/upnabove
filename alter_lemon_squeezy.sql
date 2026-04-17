-- 1. Candidate Modifications for the 'Forge Replay' Subscription
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ls_subscription_id TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ls_subscription_status TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS forge_replay_active BOOLEAN DEFAULT false;

-- 2. Employer Modifications
-- Tracks auto-promotions for 'first challenge free'. Scouting removed, Analytics is universally free.
ALTER TABLE employers ADD COLUMN IF NOT EXISTS ls_subscription_id TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS ls_subscription_status TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS challenges_posted INT DEFAULT 0;

-- 3. Forge Challenges Modifications
-- Drops existing status check briefly to inject 'pending' and 'paid' logic if required, though we'll manage via 'payment_status' decoupled field to avoid breaking front end.
ALTER TABLE forge_challenges ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'; -- pending | paid | free
ALTER TABLE forge_challenges ADD COLUMN IF NOT EXISTS ls_order_id TEXT;
ALTER TABLE forge_challenges ADD COLUMN IF NOT EXISTS checkout_url TEXT;
