-- 1. Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    resume_url TEXT NOT NULL,
    motivation_letter_url TEXT,
    motivation_text TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interviewing', 'rejected', 'hired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, candidate_id) -- Prevent duplicate applications
);

-- Enable RLS and setup policies for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can view their own applications" ON applications FOR SELECT TO authenticated USING (candidate_id = auth.uid());
CREATE POLICY "Candidates can insert applications" ON applications FOR INSERT TO authenticated WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Employers can view applications for their jobs" ON applications FOR SELECT TO authenticated USING (job_id IN (SELECT id FROM jobs WHERE employer_id = auth.uid()));
CREATE POLICY "Employers can update applications for their jobs" ON applications FOR UPDATE TO authenticated USING (job_id IN (SELECT id FROM jobs WHERE employer_id = auth.uid()));

-- 2. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'cvs', 
  'cvs', 
  true,
  10485760, -- 10MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = 10485760, 
  allowed_mime_types = ARRAY['application/pdf'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'motivation-letters', 
  'motivation-letters', 
  true,
  10485760, -- 10MB
  ARRAY['application/pdf']
) ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = 10485760, 
  allowed_mime_types = ARRAY['application/pdf'];

-- 3. Create Storage Policies for cvs
DROP POLICY IF EXISTS "CVs are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can upload their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can delete their own CVs" ON storage.objects;

CREATE POLICY "CVs are publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'cvs');
CREATE POLICY "Candidates can upload their own CVs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Candidates can delete their own CVs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Create Storage Policies for motivation-letters
DROP POLICY IF EXISTS "Motivation letters are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can upload motivation letters" ON storage.objects;
DROP POLICY IF EXISTS "Candidates can delete motivation letters" ON storage.objects;

CREATE POLICY "Motivation letters are publicly accessible" ON storage.objects FOR SELECT TO public USING (bucket_id = 'motivation-letters');
CREATE POLICY "Candidates can upload motivation letters" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'motivation-letters' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Candidates can delete motivation letters" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'motivation-letters' AND (storage.foldername(name))[1] = auth.uid()::text);
