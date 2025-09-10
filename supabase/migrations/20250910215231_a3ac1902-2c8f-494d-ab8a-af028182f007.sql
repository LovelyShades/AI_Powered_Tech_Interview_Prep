-- Fix the enum type change by handling defaults properly
-- First, remove any default constraints
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

-- Set new default
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

-- Clear existing questions to make room for new ones
DELETE FROM questions;

-- Insert sample questions for Software Engineering / Full-Stack Dev
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
('Two Sum Problem', 'Coding', 'Easy', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'javascript', 'function twoSum(nums, target)', 'function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}', '[{"input": [[2,7,11,15], 9], "expected": [0,1]}, {"input": [[3,2,4], 6], "expected": [1,2]}]', 'software_engineering'),
('Reverse Linked List', 'Coding', 'Easy', 'Given the head of a singly linked list, reverse the list, and return the reversed list.', 'javascript', 'function reverseList(head)', 'function reverseList(head) {
    let prev = null;
    let current = head;
    while (current !== null) {
        let next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}', '[{"input": [1,2,3,4,5], "expected": [5,4,3,2,1]}]', 'software_engineering'),
('Valid Parentheses', 'Coding', 'Easy', 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.', 'javascript', 'function isValid(s)', 'function isValid(s) {
    const stack = [];
    const map = {"(": "(", "}": "{", "]": "["};
    
    for (let char of s) {
        if (char in map) {
            if (stack.length === 0 || stack.pop() !== map[char]) {
                return false;
            }
        } else {
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}', '[{"input": "()", "expected": true}, {"input": "()[]{}", "expected": true}, {"input": "(]", "expected": false}]', 'software_engineering');