-- Fix coding questions with malformed test structures
-- Update questions where tests is an array instead of an object with 'cases'
UPDATE questions 
SET tests = jsonb_build_object(
  'cases', 
  (
    SELECT jsonb_agg(
      CASE 
        WHEN elem ? 'expected' THEN
          jsonb_build_object(
            'input', elem->'input',
            'expect', elem->'expected',
            'name', COALESCE(elem->>'name', 'test_case')
          )
        ELSE elem
      END
    )
    FROM jsonb_array_elements(tests) elem
  ),
  'language', 'javascript',
  'timeoutMs', 2000
)
WHERE qtype = 'Coding' 
  AND jsonb_typeof(tests) = 'array';

-- Fix questions where tests is an object but uses 'expected' instead of 'expect'
UPDATE questions
SET tests = jsonb_set(
  tests,
  '{cases}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN elem ? 'expected' THEN
          jsonb_build_object(
            'input', elem->'input',
            'expect', elem->'expected', 
            'name', COALESCE(elem->>'name', 'test_case')
          )
        ELSE elem
      END
    )
    FROM jsonb_array_elements(tests->'cases') elem
  )
)
WHERE qtype = 'Coding'
  AND jsonb_typeof(tests) = 'object'
  AND tests ? 'cases'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(tests->'cases') elem 
    WHERE elem ? 'expected'
  );

-- Add proper test cases for Maximum Subarray question (question_id 68)
UPDATE questions 
SET tests = jsonb_build_object(
  'cases', jsonb_build_array(
    jsonb_build_object(
      'input', jsonb_build_array(-2, 1, -3, 4, -1, 2, 1, -5, 4),
      'expect', 6,
      'name', 'Basic case with negative numbers'
    ),
    jsonb_build_object(
      'input', jsonb_build_array(1, 2, 3, 4, 5),
      'expect', 15,
      'name', 'All positive numbers'
    ),
    jsonb_build_object(
      'input', jsonb_build_array(-1, -2, -3, -4),
      'expect', -1,
      'name', 'All negative numbers'
    ),
    jsonb_build_object(
      'input', jsonb_build_array(5, -3, 5),
      'expect', 7,
      'name', 'Mixed positive and negative'
    )
  ),
  'language', 'javascript',
  'timeoutMs', 2000
)
WHERE question_id = 68;

-- Add proper test cases for Longest Common Subsequence question (question_id 132)
UPDATE questions 
SET tests = jsonb_build_object(
  'cases', jsonb_build_array(
    jsonb_build_object(
      'input', jsonb_build_array('abcde', 'ace'),
      'expect', 3,
      'name', 'Basic LCS case'
    ),
    jsonb_build_object(
      'input', jsonb_build_array('abc', 'abc'),
      'expect', 3,
      'name', 'Identical strings'
    ),
    jsonb_build_object(
      'input', jsonb_build_array('abc', 'def'),
      'expect', 0,
      'name', 'No common subsequence'
    ),
    jsonb_build_object(
      'input', jsonb_build_array('', 'abc'),
      'expect', 0,
      'name', 'Empty string'
    )
  ),
  'language', 'javascript',
  'timeoutMs', 2000
)
WHERE question_id = 132;

-- Add proper test cases for Quick Sort question (question_id 136)
UPDATE questions 
SET tests = jsonb_build_object(
  'cases', jsonb_build_array(
    jsonb_build_object(
      'input', jsonb_build_array(jsonb_build_array(3, 6, 8, 10, 1, 2, 1)),
      'expect', jsonb_build_array(1, 1, 2, 3, 6, 8, 10),
      'name', 'Mixed numbers'
    ),
    jsonb_build_object(
      'input', jsonb_build_array(jsonb_build_array(5, 2, 8, 1, 9)),
      'expect', jsonb_build_array(1, 2, 5, 8, 9),
      'name', 'Basic unsorted array'
    ),
    jsonb_build_object(
      'input', jsonb_build_array(jsonb_build_array(1, 2, 3, 4, 5)),
      'expect', jsonb_build_array(1, 2, 3, 4, 5),
      'name', 'Already sorted'
    ),
    jsonb_build_object(
      'input', jsonb_build_array(jsonb_build_array(5, 4, 3, 2, 1)),
      'expect', jsonb_build_array(1, 2, 3, 4, 5),
      'name', 'Reverse sorted'
    )
  ),
  'language', 'javascript',
  'timeoutMs', 2000
)
WHERE question_id = 136;