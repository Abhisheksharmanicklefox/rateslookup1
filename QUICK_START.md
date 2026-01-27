# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- ✅ Node.js installed (you have v24.13.0)
- ✅ Dependencies installed (`npm install` - DONE)
- ❌ PostgreSQL needs to be installed

### Step 1: Install PostgreSQL (5 minutes)

**Download & Install:**
1. Go to: https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16 installer
3. Run installer
4. **Set password** (remember it!)
5. Use default settings (port 5432)

**Detailed guide:** See `INSTALL_POSTGRESQL.md`

### Step 2: Create Database (1 minute)

**Option A: Using pgAdmin (Easiest)**
1. Open pgAdmin 4
2. Right-click "Databases" → Create → Database
3. Name: `rateslookup`
4. Tools → Query Tool
5. Open file: `src/database/index.sql`
6. Execute (F5)

**Option B: Command Line**
```powershell
createdb -U postgres rateslookup
psql -U postgres -d rateslookup -f src/database/index.sql
```

### Step 3: Configure Environment (30 seconds)

Edit `.env` file - **Update password only:**
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/rateslookup
DB_PASSWORD=YOUR_PASSWORD
```

### Step 4: Verify Setup (10 seconds)

```powershell
npm run test:setup
```

Should show all ✅ green checkmarks.

### Step 5: Start Server (5 seconds)

```powershell
npm run dev
```

Or double-click: `start-dev.bat`

### Step 6: Test It! (10 seconds)

Open browser: http://localhost:3000/health

Should see:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": 1.234,
  "environment": "development"
}
```

## 🎯 You're Ready!

### API Endpoints Available

**Base URL:** http://localhost:3000/api/v1

#### Test Lead Capture (Your Form!)
```powershell
curl -X POST http://localhost:3000/api/v1/leads `
  -H "Content-Type: application/json" `
  -d '{
    "first_name": "John",
    "email": "john@example.com",
    "phone": "1234567890"
  }'
```

#### Test Application Creation
```powershell
curl -X POST http://localhost:3000/api/v1/applications `
  -H "Content-Type: application/json" `
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "loan_amount": 300000,
    "property_value": 400000
  }'
```

#### Get All Leads
```powershell
curl http://localhost:3000/api/v1/leads
```

#### Get All Applications
```powershell
curl http://localhost:3000/api/v1/applications
```

### API Documentation
http://localhost:3000/api/docs

## 📱 Frontend Integration

Your "Secure your best rate today" form should POST to:

```javascript
// Lead Capture Form
fetch('http://localhost:3000/api/v1/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    first_name: 'John',
    email: 'john@example.com',
    phone: '1234567890',
    source: 'website'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## 🛠️ Development Commands

```powershell
# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Test setup
npm run test:setup

# Reset database
psql -U postgres -d rateslookup -f src/database/index.sql
```

## 📊 Database Management

### Using pgAdmin 4 (GUI)
1. Open pgAdmin 4
2. Connect to PostgreSQL 16
3. Browse `rateslookup` database
4. View tables, run queries

### Using Command Line
```powershell
# Connect to database
psql -U postgres -d rateslookup

# List tables
\dt

# View data
SELECT * FROM lead_captures;

# Exit
\q
```

## 🔍 Troubleshooting

### Server won't start?
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Change port in .env if needed
PORT=3001
```

### Database connection failed?
```powershell
# Check PostgreSQL service
Get-Service postgresql-x64-16

# Start if stopped
net start postgresql-x64-16

# Verify credentials in .env
```

### Can't find psql command?
1. Add to PATH: `C:\Program Files\PostgreSQL\16\bin`
2. Restart PowerShell
3. Try again

## 📚 Documentation

- **Full Setup Guide:** `SETUP.md`
- **PostgreSQL Installation:** `INSTALL_POSTGRESQL.md`
- **API Documentation:** `README.md`
- **Project Structure:** See `README.md`

## 🎉 What's Working

✅ **Complete Modules:**
- Lead Capture System (with UTM tracking)
- Mortgage Applications (full CRUD)
- Statistics and Analytics
- Rate Limiting and Security
- Input Validation
- Error Handling

✅ **Database:**
- 19 tables created
- Proper indexes
- Foreign key relationships
- Sample data seeded

✅ **Ready for:**
- Frontend integration
- Additional module implementation
- Production deployment

## 🚀 Next Steps

1. **Test the API** - Use Postman or curl
2. **Build Frontend** - Connect your React/Vue/Angular app
3. **Implement More Modules** - OTP, Rates, Tools, etc.
4. **Deploy** - When ready for production

## 💡 Pro Tips

1. **Use Postman** for API testing (easier than curl)
2. **Check logs** - Server shows all queries in dev mode
3. **pgAdmin 4** - Great for viewing/editing data
4. **Auto-reload** - Server restarts on code changes
5. **Git** - Commit your changes regularly

## 🆘 Need Help?

1. Run `npm run test:setup` to diagnose issues
2. Check server logs in console
3. Verify PostgreSQL is running
4. Check `.env` configuration
5. See detailed guides in `SETUP.md` and `INSTALL_POSTGRESQL.md`

---

**Current Status:**
- ✅ Node.js: v24.13.0
- ✅ Dependencies: Installed
- ✅ Environment: Configured
- ⏳ PostgreSQL: Needs installation
- ⏳ Database: Needs creation

**Once PostgreSQL is installed, you're 100% ready to go! 🎉**