-- seed_forge_challenges.sql
-- Run this in your Supabase SQL Editor to populate The Forge arena with test data.

INSERT INTO forge_challenges (
    title, 
    description, 
    challenge_type, 
    difficulty, 
    time_limit_minutes, 
    prize_description, 
    prize_value, 
    drop_time, 
    expires_at, 
    status, 
    is_sponsored, 
    sponsor_name,
    entry_count
) VALUES 
-- 1. The SCHEDULED Teaser (Drops in roughly 24 hours)
(
    'Architect the Ultimate Glassmorphism Dashboard',
    'We are looking for a state-of-the-art UI/UX overhaul for a next-gen analytics dashboard. The design must be completely flushed in Figma with working prototype links. Focus heavily on layout structure, violet color palettes (#7C3AED), and fluid micro-animations. Your codename will be anonymized until the drop concludes.',
    'design',
    'senior',
    120,
    '$1,500 Bounty + Automatic Final Round Interview',
    1500,
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '3 days',
    'scheduled',
    true,
    'Mystery FinTech',
    0
),

-- 2. The LIVE Battlefield (Running right now, expires in typical 45 minutes to trigger the urgent red countdown if we subtract)
-- Let's set expiration to 45 minutes from now to trigger the urgent heartbeat animation!
(
    'Optimize the React Virtualized List',
    'Given a massive dataset of 100,000 candidates, our current React component is stalling the main thread. Your mission: Clone the sandbox repository, rewrite the rendering logic using a custom virtual-scroll hook, and achieve stable 60FPS. Post your CodeSandbox link in the submission.',
    'code',
    'mid',
    60,
    '$500 Bounty + Vercel Swag Pack',
    500,
    NOW() - INTERVAL '15 minutes',
    NOW() + INTERVAL '45 minutes',
    'live',
    true,
    'Vercel',
    34
),

-- 3. The COMPLETED Hall of Fame (Finished 2 days ago)
(
    'Growth Strategy for Gen-Z Banking',
    'Draft a comprehensive 2-page marketing strategy targeting Gen-Z consumers. How do you acquire the first 10,000 recurring users with essentially a zero-dollar CAC budget? Unconventional organic tactics score highest.',
    'strategy',
    'junior',
    180,
    'Paid Internship at FinTech Startup',
    0,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '2 days',
    'completed',
    true,
    'Ramp',
    112
);
