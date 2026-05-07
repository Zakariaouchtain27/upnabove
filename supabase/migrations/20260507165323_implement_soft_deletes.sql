-- Migration: implement_soft_deletes
-- Adds a deleted_at column to jobs, employers, and forge_challenges.
-- A trigger on each table intercepts DELETE commands and converts them
-- to an UPDATE that sets deleted_at = NOW(), preserving all row data.

-- ─── 1. ADD COLUMNS ────────────────────────────────────────────────────────

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE employers
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE forge_challenges
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- ─── 2. INDEXES for fast "is alive?" queries ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_jobs_deleted_at
  ON jobs (deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_employers_deleted_at
  ON employers (deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_forge_challenges_deleted_at
  ON forge_challenges (deleted_at)
  WHERE deleted_at IS NULL;

-- ─── 3. TRIGGER FUNCTION ───────────────────────────────────────────────────
-- A single generic function used by all three triggers.
-- It aborts the physical DELETE and instead stamps deleted_at = NOW().

CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Re-issue the row as an UPDATE instead of a DELETE.
  EXECUTE format(
    'UPDATE %I.%I SET deleted_at = NOW() WHERE id = $1',
    TG_TABLE_SCHEMA,
    TG_TABLE_NAME
  ) USING OLD.id;

  -- Returning NULL from a BEFORE trigger cancels the original DELETE.
  RETURN NULL;
END;
$$;

-- ─── 4. ATTACH TRIGGERS ────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_soft_delete_jobs ON jobs;
CREATE TRIGGER trg_soft_delete_jobs
  BEFORE DELETE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete();

DROP TRIGGER IF EXISTS trg_soft_delete_employers ON employers;
CREATE TRIGGER trg_soft_delete_employers
  BEFORE DELETE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete();

DROP TRIGGER IF EXISTS trg_soft_delete_forge_challenges ON forge_challenges;
CREATE TRIGGER trg_soft_delete_forge_challenges
  BEFORE DELETE ON forge_challenges
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete();

-- ─── 5. VIEWS for application queries (active rows only) ───────────────────
-- These mirror the table names with a _active suffix so queries are explicit.

CREATE OR REPLACE VIEW active_jobs AS
  SELECT * FROM jobs WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_employers AS
  SELECT * FROM employers WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_forge_challenges AS
  SELECT * FROM forge_challenges WHERE deleted_at IS NULL;
