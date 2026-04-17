-- ==========================================
-- ⚠️ DEVELOPMENT ONLY: BYPASS ALL RLS ⚠️
-- Run this in your Supabase SQL Editor to
-- allow anonymous inserts/updates/deletes
-- across all Forge tables without Auth.
-- ==========================================

-- 1. forge_challenges
DROP POLICY IF EXISTS "Dev bypass ALL on challenges" ON forge_challenges;
CREATE POLICY "Dev bypass ALL on challenges" 
ON forge_challenges AS PERMISSIVE FOR ALL 
USING (true) WITH CHECK (true);

-- 2. forge_entries
DROP POLICY IF EXISTS "Dev bypass ALL on entries" ON forge_entries;
CREATE POLICY "Dev bypass ALL on entries" 
ON forge_entries AS PERMISSIVE FOR ALL 
USING (true) WITH CHECK (true);

-- 3. forge_squads
DROP POLICY IF EXISTS "Dev bypass ALL on squads" ON forge_squads;
CREATE POLICY "Dev bypass ALL on squads" 
ON forge_squads AS PERMISSIVE FOR ALL 
USING (true) WITH CHECK (true);

-- 4. forge_squad_members
DROP POLICY IF EXISTS "Dev bypass ALL on squad members" ON forge_squad_members;
CREATE POLICY "Dev bypass ALL on squad members" 
ON forge_squad_members AS PERMISSIVE FOR ALL 
USING (true) WITH CHECK (true);

-- 5. forge_votes
DROP POLICY IF EXISTS "Dev bypass ALL on votes" ON forge_votes;
CREATE POLICY "Dev bypass ALL on votes" 
ON forge_votes AS PERMISSIVE FOR ALL 
USING (true) WITH CHECK (true);

-- 6. forge_badges
DROP POLICY IF EXISTS "Dev bypass ALL on badges" ON forge_badges;
CREATE POLICY "Dev bypass ALL on badges" 
ON forge_badges AS PERMISSIVE FOR ALL 
USING (true) WITH CHECK (true);

-- Note: Because Supabase processes permissive policies with boolean OR, 
-- these "true" policies will instantly override any existing restricted policies.
