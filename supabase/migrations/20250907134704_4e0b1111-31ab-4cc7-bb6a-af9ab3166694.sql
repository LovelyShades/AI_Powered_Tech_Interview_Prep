-- First migration: Add new question types to the enum
ALTER TYPE question_type ADD VALUE 'System Design';
ALTER TYPE question_type ADD VALUE 'Technical';