-- 1. Candidates Profile Table
-- Links to Supabase's native auth.users table
CREATE TABLE candidates (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Employers Profile Table
-- Links to Supabase's native auth.users table
CREATE TABLE employers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    website_url TEXT,
    contact_email TEXT UNIQUE NOT NULL,
    description TEXT,
    industry TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')) NOT NULL,
    location TEXT NOT NULL, -- e.g., 'Global Remote', 'New York, NY'
    salary_range TEXT,      -- e.g., '$100k - $120k'
    requirements TEXT[],    -- Array of requirement strings
    benefits TEXT[],        -- Array of benefit strings
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimal querying
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_employers_company_name ON employers(company_name);
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Basic RLS Policies
-- --------------------------------------------------------

-- Candidates: public can read, candidates can manage their own profile
CREATE POLICY "Candidate profiles are viewable by everyone" ON candidates FOR SELECT USING (true);
CREATE POLICY "Candidates can create their profile" ON candidates FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Candidates can update own profile" ON candidates FOR UPDATE USING (auth.uid() = id);

-- Employers: public can read, employers can manage their own profile
CREATE POLICY "Employer profiles are viewable by everyone" ON employers FOR SELECT USING (true);
CREATE POLICY "Employers can create their profile" ON employers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Employers can update own profile" ON employers FOR UPDATE USING (auth.uid() = id);

-- Jobs: public can read, employers can manage their own jobs
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Employers can insert their own jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "Employers can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = employer_id);
CREATE POLICY "Employers can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = employer_id);
