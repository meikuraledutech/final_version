# 📋 Deployment Guide for New Instances

This guide documents the complete setup process for deploying a full-stack application (Next.js Frontend + Node.js Backend + PostgreSQL) on AWS Lightsail.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Instance Setup](#instance-setup)
3. [Install Dependencies](#install-dependencies)
4. [Clone Repository](#clone-repository)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Build & Deploy Services](#build--deploy-services)
8. [Nginx Configuration](#nginx-configuration)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [One-Command Deployment](#one-command-deployment)

---

## Prerequisites

- AWS Lightsail Instance (Amazon Linux 2023)
- SSH Key (.pem file)
- Domain names (optional, for domain-based access)
- Public IP for instance

---

## Instance Setup

### 1. Create Lightsail Instance

- **Image:** Amazon Linux 2023
- **Plan:** Minimum 2GB RAM recommended
- **Region:** Choose based on your location
- **Static IP:** Recommended

### 2. Firewall Rules (Open Ports)

Open these ports in Lightsail Networking:
- **Port 80** (HTTP) - Nginx
- **Port 443** (HTTPS) - SSL (optional)
- **Port 3000** (Direct Frontend)
- **Port 3001** (Direct Backend)
- **Port 5432** (PostgreSQL - localhost only)

### 3. Connect via SSH

```bash
ssh -i your-key.pem ec2-user@YOUR_INSTANCE_IP
```

---

## Install Dependencies

### Update System

```bash
sudo dnf update -y
```

### Install Node.js 20+

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version  # Verify v20+
```

### Install pnpm

```bash
sudo npm install -g pnpm pm2
```

### Install PostgreSQL 16

```bash
sudo dnf install -y postgresql16-server postgresql16-contrib
sudo /usr/bin/postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install Nginx

```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install Git

```bash
sudo dnf install -y git
```

### Install C/C++ Compilers (for native modules)

```bash
sudo dnf install -y gcc gcc-c++ python3
```

---

## Clone Repository

```bash
cd /home/ec2-user
git clone https://github.com/YOUR_ORG/YOUR_REPO.git
cd YOUR_REPO
```

---

## Environment Configuration

### 1. Backend .env

Create `/home/ec2-user/YOUR_REPO/backend/.env`:

```env
PORT=3001
API_BASE_URL=http://YOUR_IP:3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_here
SUPERADMIN_NAME=Admin
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=admin123
```

### 2. Frontend .env.local

Create `/home/ec2-user/YOUR_REPO/frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://YOUR_IP:3001
NEXT_PUBLIC_EXECUTE_SYSTEM_API_URL=http://YOUR_IP:3001/api/execute/system
```

### 3. Database Setup

#### Reset PostgreSQL Password

```bash
sudo -u postgres psql << SQL
ALTER USER postgres WITH PASSWORD 'postgres';
\q
SQL
```

#### Update PostgreSQL Authentication

```bash
sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql
```

#### Create Database

```bash
PGPASSWORD=postgres psql -h localhost -U postgres << SQL
CREATE DATABASE your_database_name OWNER postgres;
\q
SQL
```

#### Load Schema

```bash
cd backend
PGPASSWORD=postgres psql -h localhost -U postgres -d your_database_name < db/schema.sql
```

---

## Database Setup (Migrations & Seeding)

### Option A: Using Makefile (Recommended)

```bash
cd backend
make migrate   # Run migrations
make seed      # Seed database with superadmin
# Or: make setup  # Does both + resets DB
```

### Option B: Manual Commands

```bash
cd backend
npm run migrate  # Or pnpm migrate
npm run seed     # Or pnpm seed
```

---

## Build & Deploy Services

### 1. Install Dependencies

```bash
# Backend
cd backend && pnpm install

# Frontend
cd frontend && pnpm install
```

### 2. Build Frontend

```bash
cd frontend
pnpm build
```

### 3. Create PM2 Deployment Script

Create `/home/ec2-user/deploy.sh`:

```bash
#!/bin/bash
set -e

PROJECT_DIR="/home/ec2-user/YOUR_REPO"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "======================================"
echo "🚀 Starting Deployment Process..."
echo "======================================"

# 1. Pull latest from git
echo "📥 Pulling latest from git..."
cd $PROJECT_DIR
git pull origin master

# 2. Check PostgreSQL
echo "🗄️ Checking PostgreSQL..."
sudo systemctl start postgresql || true

# 3. Install backend dependencies
echo "📦 Installing backend dependencies..."
cd $BACKEND_DIR
pnpm install

# 4. Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd $FRONTEND_DIR
pnpm install

# 5. Build frontend
echo "🔨 Building frontend..."
pnpm build

# 6. Stop existing PM2 processes
echo "🛑 Stopping existing services..."
pm2 delete backend frontend 2>/dev/null || true

# 7. Start backend
echo "🚀 Starting backend..."
cd $BACKEND_DIR
pm2 start index.js --name "backend"

# 8. Start frontend
echo "🚀 Starting frontend..."
cd $FRONTEND_DIR
pm2 start "pnpm start" --name "frontend"

# 9. Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save
sudo pm2 startup -u ec2-user --hp /home/ec2-user

echo ""
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🌐 Access the app at:"
echo "  Frontend: http://YOUR_IP/"
echo "  Backend: http://YOUR_IP/api/"
echo ""
echo "📝 Logs:"
echo "  Backend: pm2 logs backend"
echo "  Frontend: pm2 logs frontend"
```

### 4. Make Script Executable

```bash
chmod +x /home/ec2-user/deploy.sh
```

### 5. Run Deployment Script

```bash
/home/ec2-user/deploy.sh
```

---

## Nginx Configuration

### 1. Create Nginx Config

Create `/etc/nginx/conf.d/upstreams.conf`:

```nginx
upstream frontend {
    server localhost:3000;
}

upstream backend {
    server localhost:3001;
}
```

### 2. Create Domain Config

Create `/etc/nginx/conf.d/domains.conf`:

```nginx
# Frontend Domain
server {
    listen 80;
    server_name platform.your-domain.com;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend Domain
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Default IP-based access
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Test & Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Testing

### Test Frontend

```bash
# Via Domain
curl -I http://platform.your-domain.com/

# Via IP
curl -I http://YOUR_IP/
```

### Test Backend

```bash
# Login endpoint
curl -X POST http://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Via IP
curl -X POST http://YOUR_IP/api/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Direct Port Access (Still Works)

```bash
# Frontend Direct
curl http://YOUR_IP:3000/

# Backend Direct
curl http://YOUR_IP:3001/api/colleges
```

---

## Troubleshooting

### PostgreSQL Connection Failed

**Problem:** `Ident authentication failed for user "postgres"`

**Solution:**
```bash
# Update auth method
sudo sed -i 's/ident/md5/g' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql

# Reset password
sudo -u postgres psql << SQL
ALTER USER postgres WITH PASSWORD 'postgres';
\q
SQL
```

### Frontend Not Building

**Problem:** `.next` directory missing

**Solution:**
```bash
cd frontend
pnpm build
```

### Services Not Starting

**Problem:** PM2 shows `errored`

**Solution:**
```bash
pm2 logs frontend  # Check logs
pm2 restart frontend
```

### Nginx Not Forwarding

**Problem:** 502 Bad Gateway

**Solution:**
```bash
sudo nginx -t  # Check config
pm2 status     # Verify backend/frontend running
netstat -tlnp | grep -E ':(80|3000|3001)'  # Check ports
```

### API Returning 404

**Problem:** `/api/api/` double path

**Solution:** Update frontend `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://YOUR_IP:3001
# NOT: http://YOUR_IP:3001/api
```

---

## One-Command Deployment

After initial setup, redeploy anytime with:

```bash
/home/ec2-user/deploy.sh
```

This will:
- ✅ Pull latest code from git
- ✅ Install/update dependencies
- ✅ Build frontend
- ✅ Restart services
- ✅ Show status

---

## Access Methods

| Method | URL | Notes |
|---|---|---|
| **Frontend Domain** | http://platform.your-domain.com | Via Nginx |
| **Backend Domain** | http://api.your-domain.com | Via Nginx |
| **Frontend IP** | http://YOUR_IP/ | Via Nginx Port 80 |
| **Backend IP** | http://YOUR_IP/api/ | Via Nginx Port 80 |
| **Frontend Direct** | http://YOUR_IP:3000 | Direct to Next.js |
| **Backend Direct** | http://YOUR_IP:3001 | Direct to Express |

---

## Security Notes

⚠️ **For Production:**

1. Use strong JWT secret (not `your_jwt_secret_key_here`)
2. Use strong database password
3. Enable HTTPS with Let's Encrypt
4. Restrict database access to localhost only
5. Use environment variables for secrets
6. Enable firewall rules for specific IPs if possible
7. Keep applications updated

---

## Useful Commands

```bash
# View PM2 logs
pm2 logs backend
pm2 logs frontend
pm2 logs

# Restart services
pm2 restart all
pm2 restart backend

# Stop services
pm2 stop all

# View service status
pm2 status

# Reload nginx
sudo systemctl reload nginx

# Check database connection
PGPASSWORD=postgres psql -h localhost -U postgres -d your_database_name -c "SELECT 1"

# View listening ports
sudo netstat -tlnp

# Check system resources
free -h
df -h
```

---

## Quick Reference

### Environment Variables

**Backend:**
- `PORT`: Application port (default: 3001)
- `DB_HOST`: PostgreSQL host (localhost)
- `DB_USER`: Database user (postgres)
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: production/development

**Frontend:**
- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL
- `NEXT_PUBLIC_EXECUTE_SYSTEM_API_URL`: Code execution endpoint

---

## Support & Updates

For issues, check:
1. PM2 logs: `pm2 logs`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. PostgreSQL: `PGPASSWORD=postgres psql -h localhost -U postgres`

---

**Last Updated:** March 2026
**Created For:** Full-stack deployment on AWS Lightsail
