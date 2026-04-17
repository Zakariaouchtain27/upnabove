-- Enable Realtime for the forge_challenges table
begin;
  -- remove the supabase_realtime publication
  DROP PUBLICATION IF EXISTS supabase_realtime;

  -- re-create the publication but don't add all tables yet
  CREATE PUBLICATION supabase_realtime;
commit;

-- add table to publication
ALTER PUBLICATION supabase_realtime ADD TABLE forge_challenges;
