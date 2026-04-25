-- 1. Add Columns to `jobs` table for external Adzuna jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'native';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS external_apply_url TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 2. Setup Extensions
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 3. Schedule Daily Cron Job (6:00 AM UTC)
-- This assumes your Vercel deployment URL. You can change this to localhost for testing if needed.
SELECT cron.unschedule('daily-job-seed');

SELECT cron.schedule(
  'daily-job-seed',
  '0 6 * * *', -- 6:00 AM every day
  $$
    SELECT net.http_get(
      url:='https://upnabove-zeta.vercel.app/api/jobs/seed'
    );
  $$
);
