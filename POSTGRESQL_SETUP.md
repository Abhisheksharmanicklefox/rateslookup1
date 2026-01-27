# PostgreSQL Setup - Installed via Terminal

## ✅ PostgreSQL 16 Installed Successfully!

PostgreSQL has been installed via winget. Now you need to set up the database.

## 🔑 Finding Your PostgreSQL Password

During the silent installation, PostgreSQL was installed with a default configuration. You need to set or find the password for the `postgres` user.

### Option 1: Set Password via Command Line

1. **Open Command Prompt as Administrator**

2. **Connect to PostgreSQL** (it might work without password initially):
```cmd
"C:\Program Files\PostgreSQL\16\bin\psql" -U postgres
```

3. **Set a new password**:
```sql
ALTER USER postgres PASSWORD 'your_password_here';
\q
```

### Option 2: Use pgAdmin to Set Password

1. **Open pgAdmin 4** (installed with PostgreSQL)
2. Right-click "PostgreSQL 16" → Properties
3. Set a master password when prompted
4. Right-click "Login/Group Roles" → postgres → Properties
5. Go to "Definition" tab
6. Set a new password

### Option 3: Try Common Defaults

Common default passwords:
- `postgres`
- `admin`
- `password`
- Empty (no password)

## 🚀 Quick Setup (Automated)

### Method 1: Using PowerShell Script (Recommended)

```powershell
# Run the setup script
.\setup-database.ps1
```

This will:
1. Prompt for PostgreSQL password
2. Create the `rateslookup` database
3. Import the schema (19 tables)
4. Verify installation

### Method 2: Manual Setup

1. **Add PostgreSQL to PATH** (for current session):
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

2. **Create Database**:
```powershell
createdb -U postgres rateslookup
```

3. **Import Schema**:
```powershell
psql -U postgres -d rateslookup -f src/database/index.sql
```

4. **Verify Tables**:
```powershell
psql -U postgres -d rateslookup -c "\dt"
```

## 📝 Update .env File

After setting up the database, update your `.env` file:

```env
# Replace YOUR_PASSWORD with your actual PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/rateslookup
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
```

Example:
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/rateslookup
DB_USER=postgres
DB_PASSWORD=mypassword123
```

## ✅ Verify Setup

Run the test script:
```powershell
npm run test:setup
```

You should see all green checkmarks ✅

## 🎯 Start the Server

```powershell
npm run dev
```

Server will start on: http://localhost:3000

## 🔧 Troubleshooting

### Issue: "password authentication failed"

**Solution 1: Reset Password**
```powershell
# Connect as postgres (might work without password initially)
psql -U postgres

# Set new password
ALTER USER postgres PASSWORD 'newpassword';
\q
```

**Solution 2: Edit pg_hba.conf**
1. Open: `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`
2. Find line: `host all all 127.0.0.1/32 scram-sha-256`
3. Change to: `host all all 127.0.0.1/32 trust`
4. Restart PostgreSQL service
5. Connect and set password
6. Change back to `scram-sha-256`

### Issue: "psql: command not found"

**Solution: Add to PATH permanently**
1. Press `Win + X` → System → Advanced system settings
2. Click "Environment Variables"
3. Under "System variables", find "Path"
4. Click "Edit" → "New"
5. Add: `C:\Program Files\PostgreSQL\16\bin`
6. Click OK on all dialogs
7. Restart PowerShell

### Issue: "database already exists"

This is OK! Just run the schema import:
```powershell
psql -U postgres -d rateslookup -f src/database/index.sql
```

### Issue: PostgreSQL service not running

**Start the service**:
```powershell
# Check status
Get-Service postgresql-x64-16

# Start service
Start-Service postgresql-x64-16

# Or using net command
net start postgresql-x64-16
```

## 📊 Verify Database

Check that all 19 tables were created:

```powershell
psql -U postgres -d rateslookup -c "\dt"
```

You should see:
- mortgage_applications
- application_progress
- otp_verifications
- rate_offers
- callback_requests
- lead_captures
- rate_explorations
- rate_exploration_results
- rate_rules
- tools
- tool_fields
- tool_runs
- tool_run_values
- tool_results
- mortgage_rate_history
- faq_categories
- faqs
- testimonials
- myth_fact_items

## 🎉 Success!

Once you see all green checkmarks from `npm run test:setup`, you're ready to go!

Start the server:
```powershell
npm run dev
```

Test the API:
```
http://localhost:3000/health
```

## 📚 Next Steps

1. ✅ PostgreSQL installed
2. ✅ Database created
3. ✅ Schema imported
4. ✅ .env updated
5. ✅ Server running
6. 🚀 Start building your frontend!

## 🆘 Need Help?

If you encounter issues:
1. Check PostgreSQL service is running
2. Verify password in .env
3. Try connecting with pgAdmin first
4. Check logs: `C:\Program Files\PostgreSQL\16\data\log`