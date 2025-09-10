-- Fix pick_questions function with correct type
CREATE OR REPLACE FUNCTION public.pick_questions(p_difficulty difficulty_level, p_limit integer)
RETURNS TABLE(qid bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $function$
  select question_id
  from public.questions
  where difficulty = p_difficulty
  order by random()
  limit p_limit
$function$;