-- Fix the function to bypass RLS for question selection
CREATE OR REPLACE FUNCTION public.get_questions_for_session(
  p_difficulty difficulty_level,
  p_category app_category,
  p_limit integer
)
RETURNS TABLE (
  question_id bigint,
  title text,
  qtype question_type,
  difficulty difficulty_level,
  prompt text,
  language text,
  signature text,
  tests jsonb
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    q.question_id,
    q.title,
    q.qtype,
    q.difficulty,
    q.prompt,
    q.language,
    q.signature,
    q.tests
  FROM public.questions q
  WHERE q.difficulty = p_difficulty
    AND q.category = p_category
  ORDER BY random()
  LIMIT p_limit;
$$;