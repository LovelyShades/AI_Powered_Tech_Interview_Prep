-- Add comprehensive software engineering questions including LeetCode-style problems

-- Easy Level Questions
INSERT INTO public.questions (title, qtype, difficulty, prompt, expected_answer, tests, language, signature, category) VALUES

-- Arrays & Strings - Easy
('Contains Duplicate', 'Coding', 'Easy', 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.

Example:
Input: nums = [1,2,3,1]
Output: true

Input: nums = [1,2,3,4]
Output: false', 'Use a HashSet to track seen elements. Iterate through array and check if element exists in set.', '{"cases": [{"name": "Basic duplicate", "input": [[1,2,3,1]], "expect": true}, {"name": "No duplicates", "input": [[1,2,3,4]], "expect": false}, {"name": "Empty array", "input": [[]], "expect": false}, {"name": "Single element", "input": [[1]], "expect": false}], "timeoutMs": 2000}', 'javascript', 'function containsDuplicate(nums)', 'software'),

('Valid Anagram', 'Coding', 'Easy', 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.

Example:
Input: s = "anagram", t = "nagaram"
Output: true

Input: s = "rat", t = "car"
Output: false', 'Sort both strings or use character frequency counting.', '{"cases": [{"name": "Valid anagram", "input": ["anagram", "nagaram"], "expect": true}, {"name": "Not anagram", "input": ["rat", "car"], "expect": false}, {"name": "Empty strings", "input": ["", ""], "expect": true}, {"name": "Different lengths", "input": ["ab", "abc"], "expect": false}], "timeoutMs": 2000}', 'javascript', 'function isAnagram(s, t)', 'software'),

('Palindrome Number', 'Coding', 'Easy', 'Given an integer x, return true if x is a palindrome, and false otherwise.

Example:
Input: x = 121
Output: true

Input: x = -121
Output: false', 'Convert to string and check if it reads the same forwards and backwards, or reverse the number mathematically.', '{"cases": [{"name": "Positive palindrome", "input": [121], "expect": true}, {"name": "Negative number", "input": [-121], "expect": false}, {"name": "Single digit", "input": [7], "expect": true}, {"name": "Not palindrome", "input": [123], "expect": false}], "timeoutMs": 2000}', 'javascript', 'function isPalindrome(x)', 'software'),

('Merge Two Sorted Lists', 'Coding', 'Easy', 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.

Example:
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]

For this problem, assume arrays represent linked lists.', 'Use two pointers to compare elements and build result array.', '{"cases": [{"name": "Basic merge", "input": [[1,2,4], [1,3,4]], "expect": [1,1,2,3,4,4]}, {"name": "Empty lists", "input": [[], []], "expect": []}, {"name": "One empty", "input": [[1], []], "expect": [1]}, {"name": "Different sizes", "input": [[1,2,3], [4,5,6,7]], "expect": [1,2,3,4,5,6,7]}], "timeoutMs": 2000}', 'javascript', 'function mergeTwoLists(list1, list2)', 'software'),

('Best Time to Buy and Sell Stock', 'Coding', 'Easy', 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction.

Example:
Input: prices = [7,1,5,3,6,4]
Output: 5', 'Keep track of minimum price seen so far and maximum profit.', '{"cases": [{"name": "Basic case", "input": [[7,1,5,3,6,4]], "expect": 5}, {"name": "Decreasing prices", "input": [[7,6,4,3,1]], "expect": 0}, {"name": "Single price", "input": [[1]], "expect": 0}, {"name": "Two prices", "input": [[1,5]], "expect": 4}], "timeoutMs": 2000}', 'javascript', 'function maxProfit(prices)', 'software'),

-- Medium Level Questions
('Longest Substring Without Repeating Characters', 'Coding', 'Medium', 'Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3 (The answer is "abc")

Input: s = "pwwkew"
Output: 3 (The answer is "wke")', 'Use sliding window technique with a set or map to track characters.', '{"cases": [{"name": "Basic case", "input": ["abcabcbb"], "expect": 3}, {"name": "All same", "input": ["bbbbb"], "expect": 1}, {"name": "No repeats", "input": ["abcdef"], "expect": 6}, {"name": "Mixed case", "input": ["pwwkew"], "expect": 3}], "timeoutMs": 2000}', 'javascript', 'function lengthOfLongestSubstring(s)', 'software'),

('Group Anagrams', 'Coding', 'Medium', 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.

Example:
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]', 'Use sorted string as key to group anagrams in a map.', '{"cases": [{"name": "Basic grouping", "input": [["eat","tea","tan","ate","nat","bat"]], "expect": [["bat"],["nat","tan"],["ate","eat","tea"]]}, {"name": "No anagrams", "input": [["abc","def","ghi"]], "expect": [["abc"],["def"],["ghi"]]}, {"name": "All anagrams", "input": [["abc","bca","cab"]], "expect": [["abc","bca","cab"]]}], "timeoutMs": 2000}', 'javascript', 'function groupAnagrams(strs)', 'software'),

('Product of Array Except Self', 'Coding', 'Medium', 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Do not use division.

Example:
Input: nums = [1,2,3,4]
Output: [24,12,8,6]', 'Calculate left products, then right products in separate passes.', '{"cases": [{"name": "Basic case", "input": [[1,2,3,4]], "expect": [24,12,8,6]}, {"name": "With zero", "input": [[1,0,3,4]], "expect": [0,12,0,0]}, {"name": "Two elements", "input": [[2,3]], "expect": [3,2]}, {"name": "Negative numbers", "input": [[-1,2,-3]], "expect": [6,3,-2]}], "timeoutMs": 2000}', 'javascript', 'function productExceptSelf(nums)', 'software'),

('Valid Parentheses', 'Coding', 'Medium', 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets and in the correct order.

Example:
Input: s = "()[]{}"
Output: true

Input: s = "([)]"
Output: false', 'Use a stack to track opening brackets and match with closing brackets.', '{"cases": [{"name": "Valid parentheses", "input": ["()[]{}"], "expect": true}, {"name": "Invalid order", "input": ["([)]"], "expect": false}, {"name": "Unmatched", "input": ["((("], "expect": false}, {"name": "Empty string", "input": [""], "expect": true}], "timeoutMs": 2000}', 'javascript', 'function isValid(s)', 'software'),

('Search in Rotated Sorted Array', 'Coding', 'Medium', 'You are given an integer array nums sorted in ascending order (with distinct values), and an integer target. The array is possibly rotated at some pivot. Return the index if target is found, or -1 if not.

Example:
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4', 'Use modified binary search to handle rotation.', '{"cases": [{"name": "Target found", "input": [[4,5,6,7,0,1,2], 0], "expect": 4}, {"name": "Target not found", "input": [[4,5,6,7,0,1,2], 3], "expect": -1}, {"name": "No rotation", "input": [[1,2,3,4,5], 3], "expect": 2}, {"name": "Single element", "input": [[1], 1], "expect": 0}], "timeoutMs": 2000}', 'javascript', 'function search(nums, target)', 'software'),

-- Hard Level Questions
('Trapping Rain Water', 'Coding', 'Hard', 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Example:
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6', 'Use two pointers approach or dynamic programming to find water level at each position.', '{"cases": [{"name": "Basic case", "input": [[0,1,0,2,1,0,1,3,2,1,2,1]], "expect": 6}, {"name": "No water", "input": [[3,2,1]], "expect": 0}, {"name": "Simple trap", "input": [[3,0,0,2,0,4]], "expect": 7}, {"name": "Single peak", "input": [[1,2,1]], "expect": 0}], "timeoutMs": 2000}', 'javascript', 'function trap(height)', 'software'),

('Median of Two Sorted Arrays', 'Coding', 'Hard', 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two arrays. The overall run time complexity should be O(log (m+n)).

Example:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.0', 'Use binary search to partition arrays such that left half has equal or one more element than right half.', '{"cases": [{"name": "Basic case", "input": [[1,3], [2]], "expect": 2.0}, {"name": "Even total", "input": [[1,2], [3,4]], "expect": 2.5}, {"name": "Empty array", "input": [[], [1]], "expect": 1.0}, {"name": "Different sizes", "input": [[1,2,3,4], [5,6]], "expect": 3.5}], "timeoutMs": 2000}', 'javascript', 'function findMedianSortedArrays(nums1, nums2)', 'software'),

('Merge k Sorted Lists', 'Coding', 'Hard', 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.

For this problem, assume arrays represent linked lists.', 'Use divide and conquer or priority queue approach.', '{"cases": [{"name": "Basic merge", "input": [[[1,4,5],[1,3,4],[2,6]]], "expect": [1,1,2,3,4,4,5,6]}, {"name": "Empty lists", "input": [[]], "expect": []}, {"name": "Single list", "input": [[[1,2,3]]], "expect": [1,2,3]}, {"name": "Mixed empty", "input": [[[1],[],[2]]], "expect": [1,2]}], "timeoutMs": 2000}', 'javascript', 'function mergeKLists(lists)', 'software'),

-- System Design & Behavioral Questions
('Design a URL Shortener', 'System Design', 'Medium', 'Design a URL shortening service like bit.ly. Your system should be able to:
1. Shorten long URLs to short URLs
2. Redirect short URLs to original URLs
3. Handle custom aliases
4. Analytics on click counts

Discuss the architecture, database design, and scaling considerations.', 'Consider base62 encoding, database partitioning, caching strategies, and load balancing.', NULL, NULL, NULL, 'software'),

('Tell me about a challenging bug you fixed', 'Behavioral', 'Medium', 'Describe a particularly challenging bug or technical problem you encountered in your career. Walk me through:
1. The symptoms and how you identified the issue
2. Your debugging process and tools used
3. The root cause and solution
4. What you learned from the experience', 'Use STAR method (Situation, Task, Action, Result) and focus on problem-solving approach.', NULL, NULL, NULL, 'software'),

('Explain the difference between SQL and NoSQL databases', 'Technical', 'Easy', 'Compare and contrast SQL and NoSQL databases. When would you choose one over the other? Provide specific examples and use cases.', 'Cover ACID properties, scalability, schema flexibility, consistency models, and real-world examples.', NULL, NULL, NULL, 'software'),

('How would you optimize a slow database query?', 'Technical', 'Medium', 'A critical database query in your application is running slowly and affecting user experience. Walk me through your approach to identify and fix performance issues.', 'Discuss query execution plans, indexing strategies, query optimization, database tuning, and monitoring.', NULL, NULL, NULL, 'software'),

-- More Advanced Coding Problems
('Sliding Window Maximum', 'Coding', 'Hard', 'You are given an array of integers nums and an integer k. Return an array of the maximum values in each sliding window of size k.

Example:
Input: nums = [1,3,-1,-3,5,3,6,7], k = 3
Output: [3,3,5,5,6,7]', 'Use deque to maintain indices of elements in decreasing order of their values.', '{"cases": [{"name": "Basic case", "input": [[1,3,-1,-3,5,3,6,7], 3], "expect": [3,3,5,5,6,7]}, {"name": "Single window", "input": [[1,2,3], 3], "expect": [3]}, {"name": "Window size 1", "input": [[1,2,3], 1], "expect": [1,2,3]}, {"name": "Decreasing array", "input": [[5,4,3,2,1], 2], "expect": [5,4,3,2]}], "timeoutMs": 2000}', 'javascript', 'function maxSlidingWindow(nums, k)', 'software'),

('LRU Cache', 'Coding', 'Medium', 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get(key) and put(key, value) methods.

The functions get and put must each run in O(1) average time complexity.', 'Use hashmap and doubly linked list to achieve O(1) operations.', '{"cases": [{"name": "Basic operations", "input": [["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]], "expect": [null, null, null, 1, null, -1, null, -1, 3, 4]}], "timeoutMs": 2000}', 'javascript', 'class LRUCache', 'software'),

('Word Ladder', 'Coding', 'Hard', 'Given two words, beginWord and endWord, and a dictionary wordList, return the length of the shortest transformation sequence from beginWord to endWord, where each adjacent pair of words differs by exactly one letter.

Example:
Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5', 'Use BFS to find shortest path between words.', '{"cases": [{"name": "Basic transformation", "input": ["hit", "cog", ["hot","dot","dog","lot","log","cog"]], "expect": 5}, {"name": "No transformation", "input": ["hit", "cog", ["hot","dot","dog","lot","log"]], "expect": 0}, {"name": "Direct transformation", "input": ["hot", "dot", ["hot","dot"]], "expect": 2}], "timeoutMs": 2000}', 'javascript', 'function ladderLength(beginWord, endWord, wordList)', 'software');