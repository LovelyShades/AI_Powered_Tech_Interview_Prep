-- Fix the remaining pick_questions function with 3 parameters
CREATE OR REPLACE FUNCTION public.pick_questions(p_difficulty difficulty_level, p_category app_category DEFAULT 'software'::app_category, p_limit integer DEFAULT 10)
RETURNS TABLE(question_id bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  SELECT q.question_id
  FROM public.questions q
  WHERE q.difficulty = p_difficulty
    AND q.category = p_category
  ORDER BY random()
  LIMIT p_limit;
$function$;