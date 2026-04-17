-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can view the admins list
CREATE POLICY "Admins are viewable by admins" ON admins 
FOR SELECT USING (auth.uid() IN (SELECT id FROM admins));

-- 2. Fraud & Moderation Columns for Entries
ALTER TABLE forge_entries ADD COLUMN IF NOT EXISTS fraud_score INT DEFAULT 0;
ALTER TABLE forge_entries ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;


-- 3. Moderation for Votes
ALTER TABLE forge_votes ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;


-- 4. Revenue Tracking for Challenges
-- Adds accurate payment tracking, separate from just checking if they bought a 'ls_order_id'
ALTER TABLE forge_challenges ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT 0.00;

-- 5. Ban & Sub Tracking for Candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS lifetime_revenue DECIMAL(10,2) DEFAULT 0.00;
