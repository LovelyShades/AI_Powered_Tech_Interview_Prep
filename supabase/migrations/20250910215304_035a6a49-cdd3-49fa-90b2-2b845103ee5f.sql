-- First, remove the default constraint from the category column
ALTER TABLE questions ALTER COLUMN category DROP DEFAULT;

-- Update the app_category enum to match the new categories
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

-- Update the questions table to use the new enum
ALTER TABLE questions ALTER COLUMN category TYPE app_category USING 
  CASE category::text
    WHEN 'software' THEN 'software_engineering'::app_category
    WHEN 'ai' THEN 'ai_ml'::app_category
    WHEN 'cloud' THEN 'cloud_devops'::app_category
    WHEN 'data' THEN 'database_data'::app_category
    WHEN 'cyber' THEN 'security_cyber'::app_category
    ELSE 'software_engineering'::app_category
  END;

-- Set the new default
ALTER TABLE questions ALTER COLUMN category SET DEFAULT 'software_engineering'::app_category;

-- Update the question_categories table to use the new enum
ALTER TABLE question_categories ALTER COLUMN category TYPE app_category USING 
  CASE category::text
    WHEN 'software' THEN 'software_engineering'::app_category
    WHEN 'ai' THEN 'ai_ml'::app_category
    WHEN 'cloud' THEN 'cloud_devops'::app_category
    WHEN 'data' THEN 'database_data'::app_category
    WHEN 'cyber' THEN 'security_cyber'::app_category
    ELSE 'software_engineering'::app_category
  END;

-- Drop the old enum
DROP TYPE app_category_old;