# Setup Guide for RatesLookup Backend

## Prerequisites Installation

### 1. Install PostgreSQL

#### Windows
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (recommended version: PostgreSQL 14 or higher)
3. During installation:
   - Set a password for the postgres user (remember this!)
   - Default port: 5432
   - Install pgAdmin 4 (GUI tool)
4. Add PostgreSQL to PATH:
   - Default location: `C:\Program Files\PostgreSQL\14\bin`
   - Add to System Environment Variables

#### Verify Installation
```bash
psql --version
```

### 2. Create Database

#### Option A: Using pgAdmin (GUI)
1. Open pgAdmin 4
2. Connect to PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `rateslookup`
5. Click Save

#### Option B: Using Command Line
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rateslookup;

# Exit
\q
```

### 3. Configure Environment Variables

1. Copy the `.env` file and update with your settings:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration (UPDATE THESE!)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/rateslookup
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rateslookup
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OTP_RATE_LIMIT_WINDOW_MS=300000
OTP_RATE_LIMIT_MAX_REQUESTS=5

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

**Important**: Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

### 4. Run Database Migration

#### Option A: Using psql command line
```bash
psql -U postgres -d rateslookup -f src/database/index.sql
```

#### Option B: Using pgAdmin
1. Open pgAdmin 4
2. Connect to your server
3. Select the `rateslookup` database
4. Click Tools → Query Tool
5. Open file: `src/database/index.sql`
6. Click Execute (F5)

#### Option C: Using npm script (after psql is in PATH)
```bash
npm run db:migrate
```

### 5. Start the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### 6. Verify Installation

1. Check health endpoint:
```bash
curl http://localhost:3000/health
```

Or open in browser: http://localhost:3000/health

2. Check API documentation:
```bash
curl http://localhost:3000/api/docs
```

Or open in browser: http://localhost:3000/api/docs

## Quick Start Commands

```bash
# Install dependencies
npm install

# Create database (using psql)
createdb -U postgres rateslookup

# Run database schema
psql -U postgres -d rateslookup -f src/database/index.sql

# Start development server
npm run dev
```

## Testing the API

### Test Lead Capture
```bash
curl -X POST http://localhost:3000/api/v1/leads \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "email": "john@example.com",
    "phone": "1234567890",
    "source": "website"
  }'
```

### Test Application Creation
```bash
curl -X POST http://localhost:3000/api/v1/applications \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "loan_amount": 300000,
    "property_value": 400000
  }'
```

### Get All Leads
```bash
curl http://localhost:3000/api/v1/leads
```

### Get All Applications
```bash
curl http://localhost:3000/api/v1/applications
```

## Troubleshooting

### Issue: "psql is not recognized"
**Solution**: Add PostgreSQL bin directory to your PATH environment variable
- Windows: `C:\Program Files\PostgreSQL\14\bin`

### Issue: "Database connection failed"
**Solution**: 
1. Check if PostgreSQL service is running
2. Verify credentials in `.env` file
3. Ensure database `rateslookup` exists

### Issue: "Port 3000 already in use"
**Solution**: Change PORT in `.env` file to another port (e.g., 3001)

### Issue: "Module not found"
**Solution**: Run `npm install` again

### Issue: "Permission denied" on database
**Solution**: 
1. Check PostgreSQL user permissions
2. Try using `postgres` superuser
3. Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE rateslookup TO your_user;`

## Database Management

### View Tables
```sql
-- Connect to database
psql -U postgres -d rateslookup

-- List all tables
\dt

-- Describe a table
\d mortgage_applications

-- View data
SELECT * FROM lead_captures LIMIT 10;
```

### Reset Database
```bash
# Drop and recreate database
dropdb -U postgres rateslookup
createdb -U postgres rateslookup
psql -U postgres -d rateslookup -f src/database/index.sql
```

### Backup Database
```bash
pg_dump -U postgres rateslookup > backup.sql
```

### Restore Database
```bash
psql -U postgres -d rateslookup < backup.sql
```

## Development Tips

1. **Use nodemon for auto-reload**: Already configured with `npm run dev`
2. **Check logs**: Server logs show all database queries in development mode
3. **API Testing**: Use Postman, Insomnia, or curl for testing endpoints
4. **Database GUI**: Use pgAdmin 4 for visual database management

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create database
3. ✅ Configure `.env` file
4. ✅ Run database migration
5. ✅ Start server
6. ✅ Test API endpoints
7. 🚀 Start building your frontend!

## Support

If you encounter any issues:
1. Check the error logs in the console
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running
4. Check database connection settings

For detailed API documentation, see the main README.md file.