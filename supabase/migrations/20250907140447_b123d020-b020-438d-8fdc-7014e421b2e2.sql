-- First, update the questions table RLS policy to be more restrictive
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;

-- Create a more secure policy that only allows access during active sessions
CREATE POLICY "Questions viewable only during active sessions" 
ON public.questions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.sessions 
    WHERE sessions.user_id = auth.uid() 
      AND sessions.completed_at IS NULL
      AND CAST(sessions.question_ids AS TEXT[]) @> ARRAY[CAST(questions.question_id AS TEXT)]
      AND sessions.created_at > NOW() - INTERVAL '4 hours'
  )
);

-- Create a security definer function to safely get questions for session creation
-- This function will only return question metadata without sensitive data
CREATE OR REPLACE FUNCTION public.get_questions_for_session(
  p_difficulty difficulty_level,
  p_category app_category DEFAULT 'software'::app_category,
  p_limit integer DEFAULT 10
)
RETURNS TABLE(
  question_id bigint,
  title text,
  qtype question_type,
  difficulty difficulty_level,
  prompt text,
  language text,
  signature text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    q.question_id,
    q.title,
    q.qtype,
    q.difficulty,
    q.prompt,
    q.language,
    q.signature
  FROM public.questions q
  WHERE q.difficulty = p_difficulty
    AND q.category = p_category
  ORDER BY random()
  LIMIT p_limit;
$$;

-- Create a security definer function to get complete question data only for active sessions
CREATE OR REPLACE FUNCTION public.get_session_question(
  p_question_id bigint,
  p_session_id uuid
)
RETURNS TABLE(
  question_id bigint,
  title text,
  qtype question_type,
  difficulty difficulty_level,
  prompt text,
  language text,
  signature text,
  expected_answer text,
  tests jsonb
)
LANGUAGE sql
SECURITY DEFINER
STABLE
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
    q.expected_answer,
    q.tests
  FROM public.questions q
  INNER JOIN public.sessions s ON CAST(s.question_ids AS TEXT[]) @> ARRAY[CAST(q.question_id AS TEXT)]
  WHERE q.question_id = p_question_id
    AND s.id = p_session_id
    AND s.user_id = auth.uid()
    AND s.completed_at IS NULL
    AND s.created_at > NOW() - INTERVAL '4 hours';
$$;