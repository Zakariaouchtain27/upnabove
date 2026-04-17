BEGIN;

-- Drop the existing constraint
ALTER TABLE forge_entries DROP CONSTRAINT forge_entries_status_check;

-- Add the new constraint with 'contacted' and 'interviewed'
ALTER TABLE forge_entries ADD CONSTRAINT forge_entries_status_check 
CHECK (status IN ('submitted', 'scored', 'revealed', 'contacted', 'interviewed', 'hired'));

COMMIT;
