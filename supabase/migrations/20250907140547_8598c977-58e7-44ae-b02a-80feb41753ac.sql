-- Fix the search_path security warnings for all functions
-- Update existing functions to have proper search_path

-- Fix handle_new_auth_user function
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  insert into public.users (user_id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name',''));
  return new;
end;
$function$;

-- Fix pick_questions function (the bigint version)
CREATE OR REPLACE FUNCTION public.pick_questions(p_difficulty difficulty_t, p_limit integer)
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