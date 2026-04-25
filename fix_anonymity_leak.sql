CREATE OR REPLACE VIEW public_forge_entries AS
SELECT 
  id,
  challenge_id,
  CASE WHEN is_revealed = true THEN candidate_id ELSE NULL END as candidate_id,
  squad_id,
  codename,
  submission_text,
  submission_url,
  vote_count,
  ai_score,
  ai_feedback,
  rank,
  is_revealed,
  revealed_at,
  entered_at,
  status
FROM forge_entries;
