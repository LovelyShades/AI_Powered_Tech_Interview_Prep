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

-- Drop the old enum
DROP TYPE app_category_old;

-- Clear existing questions to make room for new ones
DELETE FROM questions;

-- Add initial sample questions for each category
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
-- Software Engineering / Full-Stack Dev
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
}', '[{"input": [[2,7,11,15], 9], "expected": [0,1]}]', 'software_engineering'),

('React Component State', 'Coding', 'Medium', 'Create a React component that manages a todo list with add, remove, and toggle functionality.', 'javascript', 'function TodoList()', 'function TodoList() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState("");
    
    const addTodo = () => {
        if (input.trim()) {
            setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
            setInput("");
        }
    };
    
    return (
        <div>
            <input value={input} onChange={(e) => setInput(e.target.value)} />
            <button onClick={addTodo}>Add</button>
        </div>
    );
}', '[{"input": "component", "expected": "functional todo list"}]', 'frontend_ui'),

('Linear Regression Implementation', 'Coding', 'Medium', 'Implement a simple linear regression algorithm from scratch using gradient descent.', 'python', 'def linear_regression(X, y)', 'def linear_regression(X, y, learning_rate=0.01, iterations=1000):
    m = len(y)
    theta = np.zeros(X.shape[1])
    
    for i in range(iterations):
        predictions = X.dot(theta)
        gradient = (1/m) * X.T.dot(predictions - y)
        theta -= learning_rate * gradient
    
    return theta', '[{"input": "training_data", "expected": "trained_model"}]', 'ai_ml'),

('Docker Containerization', 'Coding', 'Medium', 'Write a Dockerfile for a Node.js application with multi-stage build and security best practices.', 'dockerfile', 'FROM node:alpine', 'FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]', '[{"input": "nodejs_app", "expected": "containerized"}]', 'cloud_devops'),

('SQL Query Optimization', 'Coding', 'Medium', 'Write an optimized SQL query to find the top 5 customers by total order value.', 'sql', 'SELECT ... FROM ...', 'SELECT 
    c.customer_id,
    c.customer_name,
    SUM(oi.quantity * oi.unit_price) as total_order_value
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
GROUP BY c.customer_id, c.customer_name
ORDER BY total_order_value DESC
LIMIT 5;', '[{"input": "customer_orders", "expected": "top_customers"}]', 'database_data'),

('System Troubleshooting', 'Behavioral', 'Medium', 'Walk me through how you would troubleshoot a server that is responding slowly to requests.', '', '', 'Check system resources (CPU, memory, disk I/O), network connectivity, application logs, database performance, recent changes, and use monitoring tools to identify bottlenecks.', '[]', 'it_systems'),

('SQL Injection Prevention', 'Coding', 'Medium', 'Write a secure function to query a database that prevents SQL injection attacks.', 'python', 'def secure_user_query(user_id)', 'def secure_user_query(user_id):
    import sqlite3
    
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Invalid user ID")
    
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    query = "SELECT * FROM users WHERE user_id = ?"
    cursor.execute(query, (user_id,))
    
    return cursor.fetchone()', '[{"input": 123, "expected": "user_data"}]', 'security_cyber');