-- ==========================================
-- SPONSORED CHALLENGES DB MIGRATION
-- Run this securely in the Supabase SQL editor
-- to attach brand marketing columns to Forge Challenges
-- ==========================================

ALTER TABLE forge_challenges
ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT,
ADD COLUMN IF NOT EXISTS prize_type TEXT CHECK (prize_type IN ('Cash', 'Gift Card', 'Product', 'Job Offer')) DEFAULT 'Cash',
ADD COLUMN IF NOT EXISTS announcement_style TEXT CHECK (announcement_style IN ('Quiet', 'Public post', 'Press release')) DEFAULT 'Public post',
ADD COLUMN IF NOT EXISTS checkout_session_id TEXT;

-- Since the original 'prize_description' was made NOT NULL during creation, 
-- and we are now expanding its scope dynamically, we rely on it natively.
