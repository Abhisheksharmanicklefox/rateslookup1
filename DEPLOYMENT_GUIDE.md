# Deployment Guide

## Overview
This guide covers deploying the RatesLookup backend to production environments.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Server Deployment](#server-deployment)
5. [Security Hardening](#security-hardening)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup Strategy](#backup-strategy)
8. [Scaling Considerations](#scaling-considerations)

---

## Pre-Deployment Checklist

### Code Review
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Input validation complete
- [ ] Security vulnerabilities addressed

### Configuration
- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] API keys and secrets rotated
- [ ] CORS origins configured
- [ ] Rate limits adjusted for production
- [ ] Logging level set appropriately

### Infrastructure
- [ ] Database server provisioned
- [ ] Application server provisioned
- [ ] Load balancer configured (if needed)
- [ ] SSL/TLS certificates obtained
- [ ] DNS records configured
- [ ] Firewall rules configured

### Monitoring
- [ ] Application monitoring setup
- [ ] Database monitoring setup
- [ ] Error tracking configured
- [ ] Uptime monitoring enabled
- [ ] Alert notifications configured

---

## Environment Configuration

### Production .env File

```env
# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://username:password@db-host:5432/rateslookup_prod
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=rateslookup_prod
DB_USER=rateslookup_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_MAX_CONNECTIONS=50
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000

# Security
JWT_SECRET=GENERATE_STRONG_SECRET_HERE
BCRYPT_ROUNDS=12

# Rate Limiting (adjust for production traffic)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
OTP_RATE_LIMIT_WINDOW_MS=300000
OTP_RATE_LIMIT_MAX_REQUESTS=5

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3

# CORS
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=info

# Optional: External Services
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=email-password
SMTP_FROM=noreply@your-domain.com

# Optional: SMS Service (for OTP)
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret

# Optional: Redis (for caching)
REDIS_URL=redis://redis-host:6379
```

### Generating Secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate strong password
openssl rand -base64 32
```

---

## Database Setup

### 1. Create Production Database

```sql
-- Connect as superuser
psql -U postgres

-- Create database user
CREATE USER rateslookup_user WITH PASSWORD 'STRONG_PASSWORD';

-- Create database
CREATE DATABASE rateslookup_prod OWNER rateslookup_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rateslookup_prod TO rateslookup_user;

-- Connect to database
\c rateslookup_prod

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rateslookup_user;
```

### 2. Run Migrations

```bash
# From your local machine
psql -h your-db-host.com -U rateslookup_user -d rateslookup_prod -f src/database/index.sql
```

### 3. Verify Database

```bash
# Connect to database
psql -h your-db-host.com -U rateslookup_user -d rateslookup_prod

# List tables
\dt

# Should see 19 tables
```

### 4. Database Security

```sql
-- Revoke public access
REVOKE ALL ON DATABASE rateslookup_prod FROM PUBLIC;

-- Set connection limits
ALTER DATABASE rateslookup_prod CONNECTION LIMIT 100;

-- Enable SSL connections only
ALTER SYSTEM SET ssl = on;
```

---

## Server Deployment

### Option 1: Traditional Server (Ubuntu/Debian)

#### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

#### 2. Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/rateslookup
sudo chown $USER:$USER /var/www/rateslookup

# Clone repository
cd /var/www/rateslookup
git clone your-repo-url .

# Install dependencies
npm install --production

# Create .env file
nano .env
# (paste production environment variables)

# Test application
npm start

# If successful, stop and setup PM2
```

#### 3. Setup PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rateslookup-api',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/rateslookup/error.log',
    out_file: '/var/log/rateslookup/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/rateslookup
sudo chown $USER:$USER /var/log/rateslookup

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# (follow the instructions provided)

# Monitor application
pm2 monit
```

#### 4. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/rateslookup

# Add configuration:
server {
    listen 80;
    server_name api.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Access logs
    access_log /var/log/nginx/rateslookup_access.log;
    error_log /var/log/nginx/rateslookup_error.log;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/rateslookup /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD [ "node", "src/server.js" ]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - rateslookup-network

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: rateslookup_prod
      POSTGRES_USER: rateslookup_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./src/database/index.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - rateslookup-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - rateslookup-network

volumes:
  postgres-data:

networks:
  rateslookup-network:
    driver: bridge
```

#### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Update application
git pull
docker-compose build
docker-compose up -d
```

---
