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

-- Drop the old enum
DROP TYPE app_category_old;

-- Clear existing questions to avoid conflicts
DELETE FROM questions;

-- Insert sample questions for Software Engineering / Full-Stack Dev
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
('Two Sum Problem', 'Coding', 'Easy', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'javascript', 'function twoSum(nums, target)', 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}', '[{"input": [[2,7,11,15], 9], "expected": [0,1]}, {"input": [[3,2,4], 6], "expected": [1,2]}]', 'software_engineering'),
('Reverse Linked List', 'Coding', 'Easy', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', 'javascript', 'function reverseList(head)', 'function reverseList(head) {\n    let prev = null;\n    let current = head;\n    while (current !== null) {\n        let next = current.next;\n        current.next = prev;\n        prev = current;\n        current = next;\n    }\n    return prev;\n}', '[{"input": [1,2,3,4,5], "expected": [5,4,3,2,1]}]', 'software_engineering'),
('Valid Parentheses', 'Coding', 'Easy', 'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.', 'javascript', 'function isValid(s)', 'function isValid(s) {\n    const stack = [];\n    const map = {'')'': ''('', ''}'': ''{'', '']'': ''[''};\n    \n    for (let char of s) {\n        if (char in map) {\n            if (stack.length === 0 || stack.pop() !== map[char]) {\n                return false;\n            }\n        } else {\n            stack.push(char);\n        }\n    }\n    \n    return stack.length === 0;\n}', '[{"input": "()", "expected": true}, {"input": "()[]{}", "expected": true}, {"input": "(]", "expected": false}]', 'software_engineering'),
('Maximum Subarray', 'Coding', 'Medium', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'javascript', 'function maxSubArray(nums)', 'function maxSubArray(nums) {\n    let maxSoFar = nums[0];\n    let maxEndingHere = nums[0];\n    \n    for (let i = 1; i < nums.length; i++) {\n        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);\n        maxSoFar = Math.max(maxSoFar, maxEndingHere);\n    }\n    \n    return maxSoFar;\n}', '[{"input": [-2,1,-3,4,-1,2,1,-5,4], "expected": 6}]', 'software_engineering'),
('System Design Architecture', 'System Design', 'Hard', 'Design a URL shortening service like bit.ly. Consider scalability, availability, and consistency requirements.', '', '', 'Key components: URL encoding service, database design, caching layer, load balancing, analytics. Consider database sharding, CDN usage, and rate limiting.', '[]', 'software_engineering'),
('REST API Design', 'System Design', 'Medium', 'Design a RESTful API for a social media platform. Include user management, posts, comments, and likes.', '', '', 'Endpoints: GET/POST /users, GET/POST /posts, GET/POST /posts/:id/comments, POST /posts/:id/like. Include authentication, pagination, rate limiting.', '[]', 'software_engineering'),
('Microservices Communication', 'Behavioral', 'Medium', 'Explain how you would handle communication between microservices in a distributed system.', '', '', 'Discuss synchronous (REST, GraphQL) vs asynchronous (message queues, event streaming) communication, service discovery, circuit breakers, and monitoring.', '[]', 'software_engineering');