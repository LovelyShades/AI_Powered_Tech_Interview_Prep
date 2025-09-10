-- Create custom types
CREATE TYPE public.app_category AS ENUM ('software', 'cloud', 'data', 'ai', 'cyber');
CREATE TYPE public.question_type AS ENUM ('Coding', 'Behavioral', 'Theory');
CREATE TYPE public.difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');

-- QUESTIONS table
CREATE TABLE IF NOT EXISTS public.questions (
  question_id bigserial PRIMARY KEY,
  category app_category NOT NULL DEFAULT 'software',
  qtype question_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  source text DEFAULT 'curated',
  title text NOT NULL,
  prompt text NOT NULL,
  expected_answer text,
  language text,
  signature text,
  tests jsonb,
  created_at timestamptz DEFAULT now()
);

-- SESSIONS table
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb NOT NULL,
  question_ids text[] NOT NULL,
  current_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ANSWERS table (submit-once enforced by PK)
CREATE TABLE IF NOT EXISTS public.answers (
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id text NOT NULL,
  idx int NOT NULL,
  raw_text text,
  code text,
  test_results jsonb,
  quick_feedback text,
  final_feedback text,
  solution_snapshot text,
  score int,
  submitted_at timestamptz,
  PRIMARY KEY (session_id, question_id)
);

-- RESULTS table
CREATE TABLE IF NOT EXISTS public.results (
  session_id uuid PRIMARY KEY REFERENCES public.sessions(id) ON DELETE CASCADE,
  total_score int,
  grade text,
  summary jsonb,
  duration_min int,
  completed_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS answers_session_idx ON public.answers(session_id);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON public.sessions(user_id);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions (public read)
CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (true);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for answers
CREATE POLICY "Users can view their own answers"
  ON public.answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = answers.session_id 
    AND sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own answers"
  ON public.answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = answers.session_id 
    AND sessions.user_id = auth.uid()
  ));

-- RLS Policies for results
CREATE POLICY "Users can view their own results"
  ON public.results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = results.session_id 
    AND sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own results"
  ON public.results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = results.session_id 
    AND sessions.user_id = auth.uid()
  ));

-- Function to pick random questions
CREATE OR REPLACE FUNCTION public.pick_questions(
  p_difficulty difficulty_level,
  p_category app_category DEFAULT 'software',
  p_limit integer DEFAULT 10
)
RETURNS TABLE(question_id bigint)
LANGUAGE sql
STABLE
AS $$
  SELECT q.question_id
  FROM public.questions q
  WHERE q.difficulty = p_difficulty
    AND q.category = p_category
  ORDER BY random()
  LIMIT p_limit;
$$;

-- Insert sample questions
INSERT INTO public.questions (category, qtype, difficulty, title, prompt, expected_answer, language, signature, tests) VALUES
('software', 'Coding', 'Easy', 'Two Sum', 
'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Constraints:
• 2 ≤ nums.length ≤ 10⁴
• -10⁹ ≤ nums[i] ≤ 10⁹
• -10⁹ ≤ target ≤ 10⁹
• Only one valid answer exists.',
'Use a hash map to store numbers and their indices as you iterate through the array.',
'javascript',
'function twoSum(nums, target) {
    // Your code here
}',
'{"language": "javascript", "timeoutMs": 1500, "cases": [
  {"name": "basic", "input": [[2,7,11,15], 9], "expect": [0,1]},
  {"name": "negative", "input": [[-1,-2,-3,-4,-5], -8], "expect": [2,4]},
  {"name": "duplicate", "input": [[3,3], 6], "expect": [0,1]}
]}'),

('software', 'Behavioral', 'Easy', 'Tell me about yourself',
'This is one of the most common interview questions. Please provide a brief professional introduction that highlights your background, skills, and what you''re looking for in your next role.',
'A good answer should be concise (2-3 minutes), highlight relevant experience, and connect to the role being discussed.',
NULL, NULL, NULL),

('software', 'Theory', 'Medium', 'Explain Big O Notation',
'What is Big O notation and why is it important in computer science? Provide examples of different time complexities.',
'Big O describes the upper bound of algorithm performance. Examples: O(1) constant, O(log n) logarithmic, O(n) linear, O(n²) quadratic.',
NULL, NULL, NULL),

('software', 'Coding', 'Medium', 'Valid Parentheses',
'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example:
Input: s = "()[]{}"
Output: true

Input: s = "([)]"
Output: false',
'Use a stack to keep track of opening brackets and match them with closing brackets.',
'javascript',
'function isValid(s) {
    // Your code here
}',
'{"language": "javascript", "timeoutMs": 1500, "cases": [
  {"name": "valid_simple", "input": ["()"], "expect": true},
  {"name": "valid_mixed", "input": ["()[{}]"], "expect": true},
  {"name": "invalid_order", "input": ["([)]"], "expect": false},
  {"name": "unmatched", "input": ["(("], "expect": false}
]}'),

('software', 'Behavioral', 'Medium', 'Describe a challenging project',
'Tell me about a challenging technical project you worked on. What made it challenging and how did you overcome the obstacles?',
'Should include: specific technical challenges, problem-solving approach, collaboration, and measurable outcomes.',
NULL, NULL, NULL);