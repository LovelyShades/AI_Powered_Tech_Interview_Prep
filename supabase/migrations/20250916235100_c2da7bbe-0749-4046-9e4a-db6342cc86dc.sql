-- Fix test data for Binary Search, Fibonacci, and Stack questions
UPDATE questions 
SET tests = jsonb_build_object(
  'cases', jsonb_build_array(
    jsonb_build_object(
      'name', 'Find target in middle',
      'input', jsonb_build_array(jsonb_build_array(1, 2, 3, 4, 5), 3),
      'expect', 2
    ),
    jsonb_build_object(
      'name', 'Find first element', 
      'input', jsonb_build_array(jsonb_build_array(1, 2, 3, 4, 5), 1),
      'expect', 0
    ),
    jsonb_build_object(
      'name', 'Find last element',
      'input', jsonb_build_array(jsonb_build_array(1, 2, 3, 4, 5), 5), 
      'expect', 4
    ),
    jsonb_build_object(
      'name', 'Target not found',
      'input', jsonb_build_array(jsonb_build_array(1, 2, 3, 4, 5), 6),
      'expect', -1
    )
  ),
  'timeoutMs', 2000
)
WHERE title = 'Binary Search Implementation';

UPDATE questions
SET tests = jsonb_build_object(
  'cases', jsonb_build_array(
    jsonb_build_object(
      'name', 'Small number',
      'input', jsonb_build_array(5),
      'expect', 5
    ),
    jsonb_build_object(
      'name', 'Medium number',
      'input', jsonb_build_array(10),
      'expect', 55
    ),
    jsonb_build_object(
      'name', 'Zero',
      'input', jsonb_build_array(0),
      'expect', 0
    ),
    jsonb_build_object(
      'name', 'One',
      'input', jsonb_build_array(1),
      'expect', 1
    )
  ),
  'timeoutMs', 2000
)
WHERE title = 'Fibonacci Sequence';

UPDATE questions
SET tests = jsonb_build_object(
  'cases', jsonb_build_array(
    jsonb_build_object(
      'name', 'Push elements',
      'input', jsonb_build_array('push', jsonb_build_array(1, 2, 3)),
      'expect', jsonb_build_array(1, 2, 3)
    ),
    jsonb_build_object(
      'name', 'Pop element',
      'input', jsonb_build_array('pop', jsonb_build_array(1, 2, 3)),
      'expect', 3
    ),
    jsonb_build_object(
      'name', 'Peek top',
      'input', jsonb_build_array('peek', jsonb_build_array(1, 2, 3)),
      'expect', 3
    ),
    jsonb_build_object(
      'name', 'Check empty',
      'input', jsonb_build_array('isEmpty', jsonb_build_array()),
      'expect', true
    )
  ),
  'timeoutMs', 2000
)
WHERE title = 'Implement Stack with Arrays';