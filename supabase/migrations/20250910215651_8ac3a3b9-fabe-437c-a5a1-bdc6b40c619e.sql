-- Add more sample questions for each category
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
-- More Software Engineering questions
('Maximum Subarray', 'Coding', 'Medium', 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.', 'javascript', 'function maxSubArray(nums)', 'function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}', '[{"input": [-2,1,-3,4,-1,2,1,-5,4], "expected": 6}]', 'software_engineering'),
('System Design', 'System Design', 'Hard', 'Design a URL shortening service like bit.ly. Consider scalability, availability, and consistency requirements.', '', '', 'Key components: URL encoding service, database design, caching layer, load balancing, analytics. Consider database sharding, CDN usage, and rate limiting.', '[]', 'software_engineering'),
('Microservices Communication', 'Behavioral', 'Medium', 'Explain how you would handle communication between microservices in a distributed system.', '', '', 'Discuss synchronous (REST, GraphQL) vs asynchronous (message queues, event streaming) communication, service discovery, circuit breakers, and monitoring.', '[]', 'software_engineering'),

-- Frontend Development / UI questions
('CSS Flexbox Layout', 'Coding', 'Medium', 'Write CSS to create a responsive navigation bar using flexbox that collapses on mobile.', 'css', '.navbar { }', '.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
}

@media (max-width: 768px) {
    .nav-links {
        flex-direction: column;
        display: none;
    }
    
    .nav-links.active {
        display: flex;
    }
}', '[{"input": "navbar", "expected": "responsive layout"}]', 'frontend_ui'),
('JavaScript Promises', 'Coding', 'Medium', 'Write a function that fetches data from multiple APIs concurrently and handles errors gracefully.', 'javascript', 'async function fetchMultipleAPIs(urls)', 'async function fetchMultipleAPIs(urls) {
    try {
        const promises = urls.map(url => fetch(url).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch ${url}`);
            return res.json();
        }));
        
        const results = await Promise.allSettled(promises);
        
        return results.map((result, index) => ({
            url: urls[index],
            status: result.status,
            data: result.status === "fulfilled" ? result.value : null,
            error: result.status === "rejected" ? result.reason.message : null
        }));
    } catch (error) {
        console.error("Error in fetchMultipleAPIs:", error);
        return [];
    }
}', '[{"input": ["https://api1.com", "https://api2.com"], "expected": "concurrent fetch results"}]', 'frontend_ui'),
('Accessibility Implementation', 'Behavioral', 'Medium', 'How would you ensure a complex web application is accessible to users with disabilities?', '', '', 'Implement ARIA labels, keyboard navigation, screen reader support, color contrast compliance, focus management, semantic HTML, alt text for images, and regular accessibility audits.', '[]', 'frontend_ui'),

-- AI / Machine Learning questions
('Decision Tree Classification', 'Coding', 'Hard', 'Implement a basic decision tree classifier with information gain splitting criteria.', 'python', 'class DecisionTree', 'class DecisionTree:
    def __init__(self, max_depth=None):
        self.max_depth = max_depth
    
    def entropy(self, y):
        _, counts = np.unique(y, return_counts=True)
        probabilities = counts / counts.sum()
        return -np.sum(probabilities * np.log2(probabilities + 1e-10))
    
    def information_gain(self, X_column, y, threshold):
        left_mask = X_column <= threshold
        right_mask = ~left_mask
        
        if len(y[left_mask]) == 0 or len(y[right_mask]) == 0:
            return 0
        
        parent_entropy = self.entropy(y)
        left_entropy = self.entropy(y[left_mask])
        right_entropy = self.entropy(y[right_mask])
        
        weighted_entropy = (len(y[left_mask]) / len(y)) * left_entropy + (len(y[right_mask]) / len(y)) * right_entropy
        
        return parent_entropy - weighted_entropy', '[{"input": "dataset", "expected": "decision_tree"}]', 'ai_ml'),
('Data Preprocessing', 'Coding', 'Medium', 'Write a function to handle missing values, outliers, and feature scaling in a dataset.', 'python', 'def preprocess_data(df)', 'def preprocess_data(df):
    # Handle missing values
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    categorical_cols = df.select_dtypes(include=["object"]).columns
    
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])
    
    # Handle outliers using IQR method
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df[col] = df[col].clip(lower_bound, upper_bound)
    
    return df', '[{"input": "raw_dataset", "expected": "preprocessed_data"}]', 'ai_ml'),

-- Cloud & DevOps questions
('Kubernetes Deployment', 'Coding', 'Hard', 'Create a Kubernetes deployment YAML for a microservice with health checks and resource limits.', 'yaml', 'apiVersion: apps/v1', 'apiVersion: apps/v1
kind: Deployment
metadata:
  name: microservice-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: microservice-app
  template:
    metadata:
      labels:
        app: microservice-app
    spec:
      containers:
      - name: app
        image: microservice:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30', '[{"input": "microservice", "expected": "k8s_deployment"}]', 'cloud_devops'),
('Infrastructure as Code', 'Coding', 'Hard', 'Write a Terraform configuration to provision a scalable web application infrastructure on AWS.', 'hcl', 'resource "aws_instance"', 'resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support = true
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_autoscaling_group" "app" {
  name = "app-asg"
  vpc_zone_identifier = aws_subnet.public[*].id
  target_group_arns = [aws_lb_target_group.app.arn]
  health_check_type = "ELB"
  
  min_size = 2
  max_size = 10
  desired_capacity = 3
}', '[{"input": "aws_infrastructure", "expected": "terraform_config"}]', 'cloud_devops'),

-- Database / Data Engineering questions
('Database Indexing Strategy', 'System Design', 'Hard', 'Design an indexing strategy for a high-traffic e-commerce database with complex queries.', '', '', 'Consider composite indexes on (category_id, price), (user_id, created_at), full-text indexes on product descriptions, partial indexes for active products, and monitoring index usage statistics.', '[]', 'database_data'),
('Data Pipeline ETL', 'Coding', 'Hard', 'Implement an ETL pipeline that processes streaming data from multiple sources and loads it into a data warehouse.', 'python', 'def etl_pipeline(sources)', 'def etl_pipeline(sources):
    def extract(source_config):
        data = []
        for source in source_config:
            if source["type"] == "api":
                response = requests.get(source["url"])
                data.extend(response.json())
            elif source["type"] == "database":
                conn = psycopg2.connect(source["connection"])
                data.extend(pd.read_sql(source["query"], conn).to_dict("records"))
        return data
    
    def transform(raw_data):
        df = pd.DataFrame(raw_data)
        df = df.dropna()
        df["processed_at"] = datetime.now()
        return df
    
    raw_data = extract(sources)
    processed_data = transform(raw_data)
    
    return {"status": "success", "records_processed": len(processed_data)}', '[{"input": "data_sources", "expected": "processed_data"}]', 'database_data'),

-- IT / Systems / Support questions
('Network Configuration', 'Coding', 'Medium', 'Write a script to configure network settings and test connectivity on a Linux server.', 'bash', '#!/bin/bash', '#!/bin/bash

# Configure network interface
echo "Configuring network interface..."
ifconfig eth0 192.168.1.100 netmask 255.255.255.0
route add default gw 192.168.1.1

# Set DNS servers
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Test connectivity
echo "Testing connectivity..."
ping -c 4 8.8.8.8
if [ $? -eq 0 ]; then
    echo "Network configuration successful"
else
    echo "Network configuration failed"
    exit 1
fi', '[{"input": "server_config", "expected": "network_configured"}]', 'it_systems'),
('System Performance Monitoring', 'Coding', 'Medium', 'Create a monitoring script that alerts when system resources exceed thresholds.', 'python', 'def monitor_system()', 'import psutil
import time

def monitor_system():
    CPU_THRESHOLD = 80
    MEMORY_THRESHOLD = 85
    DISK_THRESHOLD = 90
    
    while True:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        disk = psutil.disk_usage("/")
        disk_percent = (disk.used / disk.total) * 100
        
        alerts = []
        
        if cpu_percent > CPU_THRESHOLD:
            alerts.append(f"CPU usage high: {cpu_percent}%")
        
        if memory_percent > MEMORY_THRESHOLD:
            alerts.append(f"Memory usage high: {memory_percent}%")
        
        if disk_percent > DISK_THRESHOLD:
            alerts.append(f"Disk usage high: {disk_percent}%")
        
        if alerts:
            print("ALERT:", " | ".join(alerts))
        
        time.sleep(60)', '[{"input": "system_check", "expected": "monitoring_active"}]', 'it_systems'),

-- Security / Cybersecurity questions
('Password Security Implementation', 'Coding', 'Medium', 'Implement a secure password hashing and verification system with salt.', 'python', 'def hash_password(password)', 'import hashlib
import secrets
import hmac

def hash_password(password):
    # Generate a random salt
    salt = secrets.token_hex(32)
    
    # Hash the password with salt using PBKDF2
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000  # 100,000 iterations
    )
    
    return salt + password_hash.hex()

def verify_password(password, stored_hash):
    # Extract salt from stored hash
    salt = stored_hash[:64]
    stored_password_hash = stored_hash[64:]
    
    # Hash the provided password with the extracted salt
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )
    
    # Use constant-time comparison to prevent timing attacks
    return hmac.compare_digest(stored_password_hash, password_hash.hex())', '[{"input": "secure_password", "expected": "hashed_password"}]', 'security_cyber'),
('Cross-Site Scripting Prevention', 'Coding', 'Medium', 'Write a function to sanitize user input to prevent XSS attacks in web applications.', 'javascript', 'function sanitizeInput(userInput)', 'function sanitizeInput(userInput) {
    if (typeof userInput !== "string") {
        return "";
    }
    
    // HTML entity encoding to prevent XSS
    const entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "''": "&#39;",
        "/": "&#x2F;",
        "`": "&#x60;",
        "=": "&#x3D;"
    };
    
    const sanitized = userInput.replace(/[&<>"''`=\/]/g, function (s) {
        return entityMap[s];
    });
    
    // Additional sanitization - remove script tags and javascript: protocol
    return sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+=/gi, "");
}', '[{"input": "<script>alert(''xss'')</script>", "expected": "sanitized_output"}]', 'security_cyber');