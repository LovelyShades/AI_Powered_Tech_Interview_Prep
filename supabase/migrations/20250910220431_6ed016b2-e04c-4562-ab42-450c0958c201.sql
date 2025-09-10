-- Add questions for all missing categories

-- Frontend Development / UI questions
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
-- Easy Frontend questions
('DOM Manipulation Basics', 'Coding', 'Easy', 'Write a function that changes the text content of all elements with a specific class name.', 'javascript', 'function changeTextByClass(className, newText)', 'function changeTextByClass(className, newText) {
    const elements = document.getElementsByClassName(className);
    for (let element of elements) {
        element.textContent = newText;
    }
}', '[{"input": ["test-class", "Hello World"], "expected": "text changed"}]', 'frontend_ui'),

('Event Listener Setup', 'Coding', 'Easy', 'Create a function that adds a click event listener to a button that toggles a CSS class on a target element.', 'javascript', 'function addToggleListener(buttonId, targetId, className)', 'function addToggleListener(buttonId, targetId, className) {
    const button = document.getElementById(buttonId);
    const target = document.getElementById(targetId);
    
    button.addEventListener("click", () => {
        target.classList.toggle(className);
    });
}', '[{"input": ["btn", "target", "active"], "expected": "event listener added"}]', 'frontend_ui'),

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

('React State Management', 'Coding', 'Medium', 'Create a React component that manages a counter with increment, decrement, and reset functionality.', 'javascript', 'function Counter()', 'function Counter() {
    const [count, setCount] = useState(0);
    
    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(0);
    
    return (
        <div>
            <h2>Count: {count}</h2>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}', '[{"input": "component", "expected": "functional counter"}]', 'frontend_ui'),

('Web Accessibility Best Practices', 'Behavioral', 'Medium', 'How would you ensure a complex web application is accessible to users with disabilities?', '', '', 'Implement ARIA labels, keyboard navigation, screen reader support, color contrast compliance, focus management, semantic HTML, alt text for images, and regular accessibility audits using tools like axe-core.', '[]', 'frontend_ui');

-- AI / Machine Learning questions
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
('Linear Regression from Scratch', 'Coding', 'Medium', 'Implement a simple linear regression algorithm using gradient descent.', 'python', 'def linear_regression(X, y, learning_rate=0.01, iterations=1000)', 'def linear_regression(X, y, learning_rate=0.01, iterations=1000):
    m = len(y)
    theta = np.zeros(X.shape[1])
    
    for i in range(iterations):
        predictions = X.dot(theta)
        gradient = (1/m) * X.T.dot(predictions - y)
        theta -= learning_rate * gradient
    
    return theta', '[{"input": "training_data", "expected": "trained_model"}]', 'ai_ml'),

('K-Means Clustering', 'Coding', 'Hard', 'Implement the K-means clustering algorithm from scratch.', 'python', 'def kmeans(X, k, max_iters=100)', 'def kmeans(X, k, max_iters=100):
    centroids = X[np.random.choice(X.shape[0], k, replace=False)]
    
    for _ in range(max_iters):
        distances = np.sqrt(((X - centroids[:, np.newaxis])**2).sum(axis=2))
        labels = np.argmin(distances, axis=0)
        
        new_centroids = np.array([X[labels == i].mean(axis=0) for i in range(k)])
        
        if np.allclose(centroids, new_centroids):
            break
        centroids = new_centroids
    
    return centroids, labels', '[{"input": "dataset", "expected": "clusters"}]', 'ai_ml'),

('Neural Network Basics', 'Coding', 'Hard', 'Implement a simple neural network with one hidden layer using backpropagation.', 'python', 'class NeuralNetwork', 'class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        self.W1 = np.random.randn(input_size, hidden_size) * 0.01
        self.b1 = np.zeros((1, hidden_size))
        self.W2 = np.random.randn(hidden_size, output_size) * 0.01
        self.b2 = np.zeros((1, output_size))
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -250, 250)))
    
    def forward(self, X):
        self.z1 = np.dot(X, self.W1) + self.b1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.W2) + self.b2
        self.a2 = self.sigmoid(self.z2)
        return self.a2', '[{"input": "training_data", "expected": "neural_network"}]', 'ai_ml'),

('Overfitting vs Underfitting', 'Behavioral', 'Medium', 'Explain the concepts of overfitting and underfitting in machine learning. How would you detect and prevent them?', '', '', 'Overfitting: model performs well on training data but poorly on test data. Solutions: regularization, cross-validation, more data, early stopping. Underfitting: model performs poorly on both training and test data. Solutions: increase model complexity, add features, reduce regularization.', '[]', 'ai_ml'),

('Feature Engineering Process', 'Behavioral', 'Medium', 'Describe your approach to feature engineering for a machine learning project.', '', '', 'Analyze data distribution, handle missing values, encode categorical variables, create interaction features, apply scaling/normalization, select relevant features using statistical tests or model-based methods, validate feature importance.', '[]', 'ai_ml');

-- Cloud & DevOps questions  
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
('Docker Multi-stage Build', 'Coding', 'Medium', 'Write a Dockerfile for a Node.js application with multi-stage build and security best practices.', 'dockerfile', 'FROM node:alpine', 'FROM node:alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]', '[{"input": "nodejs_app", "expected": "containerized_app"}]', 'cloud_devops'),

('Kubernetes Deployment YAML', 'Coding', 'Hard', 'Create a Kubernetes deployment YAML for a microservice with health checks, resource limits, and horizontal pod autoscaling.', 'yaml', 'apiVersion: apps/v1', 'apiVersion: apps/v1
kind: Deployment
metadata:
  name: microservice-app
  labels:
    app: microservice-app
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
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5', '[{"input": "microservice", "expected": "k8s_deployment"}]', 'cloud_devops'),

('CI/CD Pipeline Design', 'System Design', 'Medium', 'Design a comprehensive CI/CD pipeline for a web application including testing, security scanning, and deployment strategies.', '', '', 'Stages: source control trigger, build stage, unit testing, integration testing, security scanning (SAST/DAST), artifact storage, staging deployment, automated testing, production deployment with blue-green or canary strategies, monitoring and rollback capabilities.', '[]', 'cloud_devops'),

('Infrastructure as Code with Terraform', 'Coding', 'Hard', 'Write a Terraform configuration to provision a scalable web application infrastructure on AWS.', 'hcl', 'resource "aws_vpc"', 'resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "main-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "main-igw"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}

resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = "ami-0abcdef1234567890"
  instance_type = "t3.micro"
  
  vpc_security_group_ids = [aws_security_group.app.id]
  
  user_data = base64encode(<<-EOF
              #!/bin/bash
              yum update -y
              yum install -y httpd
              systemctl start httpd
              systemctl enable httpd
              echo "<h1>Hello World</h1>" > /var/www/html/index.html
              EOF
  )
  
  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "app-instance"
    }
  }
}', '[{"input": "aws_infrastructure", "expected": "terraform_config"}]', 'cloud_devops'),

('Microservices Monitoring Strategy', 'System Design', 'Medium', 'Design a comprehensive monitoring and logging strategy for a distributed microservices architecture.', '', '', 'Components: centralized logging with ELK/EFK stack, metrics collection with Prometheus, distributed tracing with Jaeger/Zipkin, alerting with AlertManager, dashboards with Grafana, health checks, SLA monitoring, and incident response procedures.', '[]', 'cloud_devops');

-- Database / Data Engineering questions
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
('SQL Query Optimization', 'Coding', 'Medium', 'Write an optimized SQL query to find the top 5 customers by total order value in the last 6 months.', 'sql', 'SELECT ... FROM ...', 'SELECT 
    c.customer_id,
    c.customer_name,
    SUM(oi.quantity * oi.unit_price) as total_order_value
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
INNER JOIN order_items oi ON o.order_id = oi.order_id
WHERE o.order_date >= DATEADD(month, -6, GETDATE())
GROUP BY c.customer_id, c.customer_name
ORDER BY total_order_value DESC
LIMIT 5;', '[{"input": "customer_orders", "expected": "top_5_customers"}]', 'database_data'),

('Database Indexing Strategy', 'System Design', 'Hard', 'Design an indexing strategy for a high-traffic e-commerce database with complex queries.', '', '', 'Consider composite indexes on (category_id, price), (user_id, created_at), full-text indexes on product descriptions, partial indexes for active products, covering indexes for frequent queries, and monitoring index usage statistics with regular maintenance.', '[]', 'database_data'),

('ETL Pipeline Implementation', 'Coding', 'Hard', 'Implement an ETL pipeline that processes streaming data from multiple sources and loads it into a data warehouse.', 'python', 'def etl_pipeline(sources)', 'def etl_pipeline(sources):
    def extract(source_config):
        data = []
        for source in source_config:
            try:
                if source["type"] == "api":
                    response = requests.get(source["url"], timeout=30)
                    response.raise_for_status()
                    data.extend(response.json())
                elif source["type"] == "database":
                    conn = psycopg2.connect(source["connection"])
                    df = pd.read_sql(source["query"], conn)
                    data.extend(df.to_dict("records"))
                    conn.close()
            except Exception as e:
                logging.error(f"Error extracting from {source}: {e}")
        return data
    
    def transform(raw_data):
        df = pd.DataFrame(raw_data)
        df = df.dropna()
        df["processed_at"] = datetime.now()
        # Add data validation and cleaning logic
        return df
    
    def load(processed_data, target_config):
        engine = create_engine(target_config["connection"])
        processed_data.to_sql(
            target_config["table"], 
            engine, 
            if_exists="append", 
            index=False,
            method="multi"
        )
    
    raw_data = extract(sources)
    processed_data = transform(raw_data)
    load(processed_data, target_config)
    
    return {"status": "success", "records_processed": len(processed_data)}', '[{"input": "data_sources", "expected": "processed_data"}]', 'database_data'),

('NoSQL vs Relational Databases', 'Behavioral', 'Medium', 'When would you choose a NoSQL database over a relational database for a project?', '', '', 'Choose NoSQL for: flexible/evolving schemas, horizontal scaling requirements, document-based data, high write loads, eventual consistency acceptable, rapid prototyping. Choose SQL for: complex queries with joins, ACID transactions, data integrity requirements, mature tooling ecosystem, well-defined relationships.', '[]', 'database_data'),

('Data Warehouse Schema Design', 'System Design', 'Hard', 'Design a data warehouse schema for an analytics platform that handles customer behavior, sales, and inventory data.', '', '', 'Implement star schema with fact tables (sales_fact, behavior_fact, inventory_fact) and dimension tables (customer_dim, product_dim, time_dim, location_dim). Include slowly changing dimensions (SCD Type 1/2/3), aggregation tables for performance, partitioning strategies by date, and data lineage tracking.', '[]', 'database_data');

-- IT / Systems / Support questions
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
('Server Performance Troubleshooting', 'Behavioral', 'Medium', 'Walk me through how you would troubleshoot a server that is responding slowly to requests.', '', '', 'Check system resources (CPU, memory, disk I/O, network), analyze application logs, examine database performance, review recent changes, use monitoring tools like top/htop, check for memory leaks, analyze network latency, and implement performance profiling to identify bottlenecks.', '[]', 'it_systems'),

('Linux Network Configuration Script', 'Coding', 'Medium', 'Write a bash script to configure network settings and test connectivity on a Linux server.', 'bash', '#!/bin/bash', '#!/bin/bash

# Configuration variables
INTERFACE="eth0"
IP_ADDRESS="192.168.1.100"
NETMASK="255.255.255.0"
GATEWAY="192.168.1.1"
DNS1="8.8.8.8"
DNS2="8.8.4.4"

# Configure network interface
echo "Configuring network interface $INTERFACE..."
ifconfig $INTERFACE $IP_ADDRESS netmask $NETMASK
route add default gw $GATEWAY

# Set DNS servers
echo "Configuring DNS servers..."
echo "nameserver $DNS1" > /etc/resolv.conf
echo "nameserver $DNS2" >> /etc/resolv.conf

# Test connectivity
echo "Testing connectivity..."
if ping -c 4 $DNS1 > /dev/null 2>&1; then
    echo "✓ Network connectivity successful"
else
    echo "✗ Network connectivity failed"
    exit 1
fi

# Test DNS resolution
if nslookup google.com > /dev/null 2>&1; then
    echo "✓ DNS resolution working"
else
    echo "✗ DNS resolution failed"
    exit 1
fi

echo "Network setup completed successfully"', '[{"input": "server_config", "expected": "network_configured"}]', 'it_systems'),

('Disaster Recovery Planning', 'System Design', 'Hard', 'Design a comprehensive backup and disaster recovery strategy for a critical business application.', '', '', 'Include automated daily/weekly backups, offsite storage (3-2-1 rule), recovery time objectives (RTO), recovery point objectives (RPO), testing procedures, documentation, failover mechanisms, database replication, application clustering, and regular DR drills with documented procedures.', '[]', 'it_systems'),

('Active Directory User Management', 'Coding', 'Medium', 'Write a PowerShell script to create users in Active Directory from a CSV file with proper error handling.', 'powershell', 'Import-Module ActiveDirectory', 'Import-Module ActiveDirectory

$csvPath = "users.csv"
$logPath = "user_creation_$(Get-Date -Format "yyyyMMdd_HHmmss").log"

function Write-Log {
    param($Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Tee-Object -FilePath $logPath -Append
}

try {
    if (-not (Test-Path $csvPath)) {
        throw "CSV file not found: $csvPath"
    }
    
    $users = Import-Csv $csvPath
    $successCount = 0
    $errorCount = 0
    
    foreach ($user in $users) {
        try {
            # Validate required fields
            if (-not $user.Username -or -not $user.FirstName -or -not $user.LastName) {
                throw "Missing required fields for user entry"
            }
            
            $userParams = @{
                Name = "$($user.FirstName) $($user.LastName)"
                GivenName = $user.FirstName
                Surname = $user.LastName
                SamAccountName = $user.Username
                UserPrincipalName = "$($user.Username)@domain.com"
                Path = $user.OU
                AccountPassword = (ConvertTo-SecureString $user.TempPassword -AsPlainText -Force)
                Enabled = $true
                ChangePasswordAtLogon = $true
            }
            
            New-ADUser @userParams
            Write-Log "✓ Successfully created user: $($user.Username)"
            $successCount++
            
        } catch {
            Write-Log "✗ Failed to create user $($user.Username): $($_.Exception.Message)"
            $errorCount++
        }
    }
    
    Write-Log "User creation completed. Success: $successCount, Errors: $errorCount"
    
} catch {
    Write-Log "✗ Script failed: $($_.Exception.Message)"
    exit 1
}', '[{"input": "user_csv", "expected": "ad_users_created"}]', 'it_systems'),

('System Resource Monitoring', 'Coding', 'Medium', 'Create a Python monitoring script that alerts when system resources exceed defined thresholds.', 'python', 'def monitor_system()', 'import psutil
import smtplib
import time
import logging
from email.mime.text import MIMEText
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def monitor_system():
    # Configurable thresholds
    CPU_THRESHOLD = 80
    MEMORY_THRESHOLD = 85
    DISK_THRESHOLD = 90
    CHECK_INTERVAL = 60  # seconds
    
    logging.info("Starting system monitoring...")
    
    while True:
        try:
            # Check CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Check memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Check disk usage
            disk = psutil.disk_usage("/")
            disk_percent = (disk.used / disk.total) * 100
            
            alerts = []
            
            if cpu_percent > CPU_THRESHOLD:
                alerts.append(f"HIGH CPU: {cpu_percent:.1f}% (threshold: {CPU_THRESHOLD}%)")
            
            if memory_percent > MEMORY_THRESHOLD:
                alerts.append(f"HIGH MEMORY: {memory_percent:.1f}% (threshold: {MEMORY_THRESHOLD}%)")
            
            if disk_percent > DISK_THRESHOLD:
                alerts.append(f"HIGH DISK: {disk_percent:.1f}% (threshold: {DISK_THRESHOLD}%)")
            
            if alerts:
                alert_message = f"SYSTEM ALERT at {datetime.now()}:\\n" + "\\n".join(alerts)
                logging.warning(alert_message)
                # In production, you would send this via email/SMS/Slack
                send_alert(alert_message)
            else:
                logging.info(f"System OK - CPU: {cpu_percent:.1f}%, Memory: {memory_percent:.1f}%, Disk: {disk_percent:.1f}%")
            
            time.sleep(CHECK_INTERVAL)
            
        except Exception as e:
            logging.error(f"Monitoring error: {e}")
            time.sleep(CHECK_INTERVAL)

def send_alert(message):
    # Placeholder for alert sending mechanism
    print(f"ALERT: {message}")
    # In production: send email, Slack notification, etc.', '[{"input": "system_check", "expected": "monitoring_active"}]', 'it_systems');

-- Security / Cybersecurity questions
INSERT INTO questions (title, qtype, difficulty, prompt, language, signature, expected_answer, tests, category) VALUES
('SQL Injection Prevention', 'Coding', 'Medium', 'Write a secure function to query a database that prevents SQL injection attacks.', 'python', 'def secure_user_query(user_id)', 'def secure_user_query(user_id):
    import sqlite3
    import logging
    
    # Input validation
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Invalid user ID: must be positive integer")
    
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        
        # Use parameterized query to prevent SQL injection
        query = "SELECT user_id, username, email, created_at FROM users WHERE user_id = ?"
        cursor.execute(query, (user_id,))
        
        result = cursor.fetchone()
        
        if result:
            return {
                "user_id": result[0],
                "username": result[1],
                "email": result[2],
                "created_at": result[3]
            }
        else:
            return None
            
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
        raise Exception("Database query failed")
    finally:
        if conn:
            conn.close()', '[{"input": 123, "expected": "user_data"}]', 'security_cyber'),

('Secure Password Hashing', 'Coding', 'Medium', 'Implement a secure password hashing and verification system with salt and proper iteration count.', 'python', 'def hash_password(password)', 'import hashlib
import secrets
import hmac
import base64

def hash_password(password):
    if not password or len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    
    # Generate a cryptographically secure random salt
    salt = secrets.token_bytes(32)
    
    # Hash the password with salt using PBKDF2 with SHA-256
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000,  # 100,000 iterations (OWASP recommended minimum)
        dklen=32
    )
    
    # Combine salt and hash for storage
    combined = salt + password_hash
    return base64.b64encode(combined).decode("utf-8")

def verify_password(password, stored_hash):
    try:
        # Decode the stored hash
        combined = base64.b64decode(stored_hash.encode("utf-8"))
        
        # Extract salt (first 32 bytes) and hash (remaining bytes)
        salt = combined[:32]
        stored_password_hash = combined[32:]
        
        # Hash the provided password with the extracted salt
        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            100000,
            dklen=32
        )
        
        # Use constant-time comparison to prevent timing attacks
        return hmac.compare_digest(stored_password_hash, password_hash)
    except Exception:
        return False', '[{"input": "secure_password123", "expected": "hashed_password"}]', 'security_cyber'),

('XSS Prevention and Input Sanitization', 'Coding', 'Medium', 'Write a comprehensive function to sanitize user input to prevent XSS attacks in web applications.', 'javascript', 'function sanitizeInput(userInput)', 'function sanitizeInput(userInput) {
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
    
    // First pass: encode HTML entities
    let sanitized = userInput.replace(/[&<>"''`=\/]/g, function (s) {
        return entityMap[s];
    });
    
    // Remove potentially dangerous HTML tags and attributes
    sanitized = sanitized
        .replace(/<script[^>]*>.*?<\/script>/gi, "")  // Remove script tags
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")  // Remove iframe tags
        .replace(/<object[^>]*>.*?<\/object>/gi, "")  // Remove object tags
        .replace(/<embed[^>]*>/gi, "")                // Remove embed tags
        .replace(/javascript:/gi, "")                 // Remove javascript: protocol
        .replace(/vbscript:/gi, "")                   // Remove vbscript: protocol
        .replace(/data:/gi, "")                       // Remove data: protocol
        .replace(/on\w+\s*=/gi, "");                  // Remove event handlers
    
    return sanitized.trim();
}

// Additional function for setting Content Security Policy
function setSecurityHeaders(response) {
    response.setHeader(
        "Content-Security-Policy",
        "default-src ''self''; " +
        "script-src ''self'' ''unsafe-inline'' ''unsafe-eval''; " +
        "style-src ''self'' ''unsafe-inline''; " +
        "img-src ''self'' data: https:; " +
        "connect-src ''self''"
    );
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("X-XSS-Protection", "1; mode=block");
}', '[{"input": "<script>alert(''xss'')</script>", "expected": "sanitized_output"}]', 'security_cyber'),

('Security Audit Framework Design', 'System Design', 'Hard', 'Design a comprehensive security audit framework for a web application.', '', '', 'Framework components: vulnerability scanning (OWASP ZAP, Nessus), penetration testing procedures, code review processes (SAST with SonarQube), compliance checks (OWASP Top 10, PCI DSS), access control audits, encryption verification, security monitoring, incident response procedures, threat modeling, and regular security training programs.', '[]', 'security_cyber'),

('JWT Token Security Implementation', 'Coding', 'Medium', 'Implement secure JWT token generation and validation with proper security measures and refresh token handling.', 'javascript', 'function generateJWT(payload)', 'const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Environment variables (should be set securely)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString("hex");
const JWT_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

function generateJWT(payload) {
    // Validate payload
    if (!payload || !payload.userId || typeof payload.userId !== "string") {
        throw new Error("Invalid payload: userId is required");
    }
    
    // Sanitize payload - remove sensitive information
    const sanitizedPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        // Do not include passwords or other sensitive data
    };
    
    // Add security claims
    const tokenPayload = {
        ...sanitizedPayload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
        iss: "your-app-name",
        aud: "your-app-users",
        jti: crypto.randomUUID(), // Unique token ID for revocation
    };
    
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: JWT_EXPIRES_IN
    });
    
    const refreshTokenPayload = {
        userId: payload.userId,
        tokenVersion: payload.tokenVersion || 1,
        type: "refresh"
    };
    
    const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, {
        algorithm: "HS256",
        expiresIn: REFRESH_EXPIRES_IN
    });
    
    return { 
        accessToken, 
        refreshToken,
        expiresIn: 15 * 60 // seconds
    };
}

function validateJWT(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ["HS256"],
            issuer: "your-app-name",
            audience: "your-app-users",
            maxAge: "15m"
        });
        
        // Additional validation
        if (!decoded.userId || !decoded.iat || !decoded.exp) {
            throw new Error("Invalid token structure");
        }
        
        return { valid: true, payload: decoded };
    } catch (error) {
        return { 
            valid: false, 
            error: error.name === "TokenExpiredError" ? "expired" : "invalid" 
        };
    }
}

function refreshAccessToken(refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
            algorithms: ["HS256"]
        });
        
        if (decoded.type !== "refresh") {
            throw new Error("Invalid refresh token");
        }
        
        // Generate new access token
        return generateJWT({
            userId: decoded.userId,
            tokenVersion: decoded.tokenVersion
        });
    } catch (error) {
        throw new Error("Invalid refresh token");
    }
}', '[{"input": "user_payload", "expected": "jwt_tokens"}]', 'security_cyber');