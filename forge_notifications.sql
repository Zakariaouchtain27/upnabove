-- forge_notifications.sql

-- 1. Create the base table
CREATE TABLE forge_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('challenge_live', 'rank_change', 'revealed', 'hired', 'squad_invite', 'streak_reminder', 'badge_earned', 'system')) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Indexes for fast dashboard loading
CREATE INDEX idx_forge_notifications_candidate_id ON forge_notifications(candidate_id);
CREATE INDEX idx_forge_notifications_is_read ON forge_notifications(is_read);

-- 3. Row Level Security policies
ALTER TABLE forge_notifications ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own notifications
CREATE POLICY "Candidates can view their own notifications"
ON forge_notifications FOR SELECT
USING (auth.uid() = candidate_id);

-- Candidates can update their own notifications (e.g. marking as read)
CREATE POLICY "Candidates can update their own notifications"
ON forge_notifications FOR UPDATE
USING (auth.uid() = candidate_id);

-- System services / service roles bypassing RLS will insert these via backend
-- But allowing insert if needed for some user-invoked things (like squad invites)
-- We will use service_role keys in API routes for most entries, so we don't necessarily need insert RLS here.

-- 4. Enable Supabase Realtime for this table
-- This MUST be executed so the JS client `on('postgres_changes')` fires appropriately.
ALTER PUBLICATION supabase_realtime ADD TABLE forge_notifications;
