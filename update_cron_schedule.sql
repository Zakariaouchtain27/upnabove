-- 1. Unschedule the old job
SELECT cron.unschedule('daily-adzuna-seed');

-- 2. Schedule the new job with the Authorization header
-- WARNING: Replace 'YOUR_SUPER_SECRET_CRON_KEY_123' with your actual secret key BEFORE running this!
SELECT cron.schedule(
    'daily-adzuna-seed',
    '0 6 * * *',
    $$
    SELECT net.http_get(
        url:='https://upnabove-zeta.vercel.app/api/jobs/seed',
        headers:='{"Authorization": "Bearer YOUR_SUPER_SECRET_CRON_KEY_123"}'::jsonb
    );
    $$
);
