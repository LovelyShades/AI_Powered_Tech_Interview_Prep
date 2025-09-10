-- Remove duplicate questions by keeping only the first occurrence of each title per category
DELETE FROM questions 
WHERE question_id NOT IN (
    SELECT MIN(question_id) 
    FROM questions 
    GROUP BY title, category
);

-- Update the get_questions_for_session function to ensure truly unique questions
CREATE OR REPLACE FUNCTION public.get_questions_for_session(p_difficulty difficulty_level, p_category app_category DEFAULT 'software_engineering'::app_category, p_limit integer DEFAULT 10)
 RETURNS TABLE(question_id bigint, title text, qtype question_type, difficulty difficulty_level, prompt text, language text, signature text, tests jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH unique_questions AS (
    SELECT DISTINCT ON (q.title) 
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
    ORDER BY q.title, q.question_id
  )
  SELECT 
    uq.question_id,
    uq.title,
    uq.qtype,
    uq.difficulty,
    uq.prompt,
    uq.language,
    uq.signature,
    uq.tests
  FROM unique_questions uq
  ORDER BY random()
  LIMIT p_limit;
$function$;

-- Also update the pick_questions function for consistency
CREATE OR REPLACE FUNCTION public.pick_questions(p_difficulty difficulty_level, p_category app_category DEFAULT 'software_engineering'::app_category, p_limit integer DEFAULT 10)
 RETURNS TABLE(question_id bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH unique_questions AS (
    SELECT DISTINCT ON (q.title) q.question_id
    FROM public.questions q
    WHERE q.difficulty = p_difficulty
      AND q.category = p_category
    ORDER BY q.title, q.question_id
  )
  SELECT uq.question_id
  FROM unique_questions uq
  ORDER BY random()
  LIMIT p_limit;
$function$;