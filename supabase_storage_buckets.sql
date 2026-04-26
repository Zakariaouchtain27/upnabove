-- ============================================
-- Supabase Storage Buckets for UpnAbove
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the 'cvs' bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;
ON CONFLICT (id) DO NOTHING;

-- 2. Create the 'submissions' bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Create the 'logos' bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = excluded.public;

-- 3. RLS Policies for 'cvs' bucket
-- Users can upload their own CVs (path must start with their user ID)
CREATE POLICY "Users can upload own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own CVs
CREATE POLICY "Users can view own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own CVs
CREATE POLICY "Users can delete own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. RLS Policies for 'submissions' bucket
-- Users can upload their own submissions
CREATE POLICY "Users can upload own submissions"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own submissions
CREATE POLICY "Users can delete own submissions"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. RLS Policies for 'logos' bucket
-- Public can view logos
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Authenticated employers can upload logos
CREATE POLICY "Employers can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Employers can update/delete their own logos
CREATE POLICY "Employers can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos');
