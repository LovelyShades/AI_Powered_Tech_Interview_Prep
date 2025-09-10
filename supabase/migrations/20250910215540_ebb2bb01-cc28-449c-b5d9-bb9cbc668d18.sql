-- Drop functions that depend on the old enum
DROP FUNCTION IF EXISTS pick_questions(difficulty_level, app_category, integer);
DROP FUNCTION IF EXISTS get_questions_for_session(difficulty_level, app_category, integer);

-- Remove default constraint
ALTER TABLE questions ALTER COLUMN category DROP DEFAULT;

-- Update the app_category enum
ALTER TYPE app_category RENAME TO app_category_old;

CREATE TYPE app_category AS ENUM (
  'software_engineering',
  'frontend_ui', 
  'ai_ml',
  'cloud_devops',
  'database_data',
  'it_systems',
  'security_cyber'
);

-- Update the questions table
ALTER TABLE questions ALTER COLUMN category TYPE app_category USING 
  CASE category::text
    WHEN 'software' THEN 'software_engineering'::app_category
    WHEN 'ai' THEN 'ai_ml'::app_category
    WHEN 'cloud' THEN 'cloud_devops'::app_category
    WHEN 'data' THEN 'database_data'::app_category
    WHEN 'cyber' THEN 'security_cyber'::app_category
    ELSE 'software_engineering'::app_category
  END;

-- Set new default
ALTER TABLE questions ALTER COLUMN category SET DEFAULT 'software_engineering'::app_category;

-- Drop the old enum
DROP TYPE app_category_old CASCADE;

-- Recreate the functions with new enum
CREATE OR REPLACE FUNCTION public.get_questions_for_session(p_difficulty difficulty_level, p_category app_category DEFAULT 'software_engineering'::app_category, p_limit integer DEFAULT 10)
 RETURNS TABLE(question_id bigint, title text, qtype question_type, difficulty difficulty_level, prompt text, language text, signature text, tests jsonb)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.pick_questions(p_difficulty difficulty_level, p_category app_category DEFAULT 'software_engineering'::app_category, p_limit integer DEFAULT 10)
 RETURNS TABLE(question_id bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT q.question_id
  FROM public.questions q
  WHERE q.difficulty = p_difficulty
    AND q.category = p_category
  ORDER BY random()
  LIMIT p_limit;
$function$;