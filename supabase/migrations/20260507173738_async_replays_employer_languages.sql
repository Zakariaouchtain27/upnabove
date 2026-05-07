-- Migration: async_replays_employer_languages
-- Adds allowed_languages to forge_challenges, replay_json_url to forge_entries,
-- creates private replays storage bucket with RLS policies.

-- ── 1. allowed_languages on forge_challenges ─────────────────────────────────
ALTER TABLE forge_challenges
  ADD COLUMN IF NOT EXISTS allowed_languages TEXT[]
    DEFAULT ARRAY['javascript','python','typescript']::TEXT[];

-- ── 2. replay_json_url on forge_entries ──────────────────────────────────────
ALTER TABLE forge_entries
  ADD COLUMN IF NOT EXISTS replay_json_url TEXT DEFAULT NULL;

-- ── 3. Private replays storage bucket ────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('replays', 'replays', false)
ON CONFLICT (id) DO NOTHING;

-- ── 4. RLS on storage.objects for replays bucket ─────────────────────────────

DROP POLICY IF EXISTS "Candidates can upload their own replay" ON storage.objects;
CREATE POLICY "Candidates can upload their own replay"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'replays'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Employers can view replays" ON storage.objects;
CREATE POLICY "Employers can view replays"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'replays'
  AND EXISTS (
    SELECT 1 FROM employers e WHERE e.id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Candidates can view own replay" ON storage.objects;
CREATE POLICY "Candidates can view own replay"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'replays'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
