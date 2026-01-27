# PostgreSQL Installation Guide for Windows

## Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download the latest version (PostgreSQL 16 recommended)
4. Choose Windows x86-64 installer

## Step 2: Install PostgreSQL

1. **Run the installer** (postgresql-16.x-windows-x64.exe)

2. **Installation Directory**
   - Default: `C:\Program Files\PostgreSQL\16`
   - Click "Next"

3. **Select Components**
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (GUI tool)
   - ✅ Stack Builder (optional)
   - ✅ Command Line Tools
   - Click "Next"

4. **Data Directory**
   - Default: `C:\Program Files\PostgreSQL\16\data`
   - Click "Next"

5. **Set Password**
   - **IMPORTANT**: Set a password for the postgres superuser
   - **Remember this password!** You'll need it for the .env file
   - Example: `postgres123` (use a stronger password in production)
   - Click "Next"

6. **Port**
   - Default: `5432`
   - Click "Next"

7. **Locale**
   - Default: [Default locale]
   - Click "Next"

8. **Summary**
   - Review settings
   - Click "Next" to install

9. **Installation**
   - Wait for installation to complete
   - Uncheck "Launch Stack Builder" (optional)
   - Click "Finish"

## Step 3: Add PostgreSQL to PATH

### Option A: Automatic (Recommended)
The installer usually adds PostgreSQL to PATH automatically.

### Option B: Manual
If `psql` command is not recognized:

1. Open "Environment Variables"
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"

2. Edit PATH variable
   - Under "System variables", find "Path"
   - Click "Edit"
   - Click "New"
   - Add: `C:\Program Files\PostgreSQL\16\bin`
   - Click "OK" on all dialogs

3. **Restart your terminal/PowerShell**

### Verify Installation
Open a new PowerShell window and run:
```powershell
psql --version
```

You should see: `psql (PostgreSQL) 16.x`

## Step 4: Create Database

### Option A: Using pgAdmin 4 (GUI - Easiest)

1. **Open pgAdmin 4**
   - Start Menu → pgAdmin 4

2. **Connect to Server**
   - Expand "Servers" in the left panel
   - Click "PostgreSQL 16"
   - Enter your password when prompted

3. **Create Database**
   - Right-click "Databases"
   - Select "Create" → "Database..."
   - Database name: `rateslookup`
   - Owner: `postgres`
   - Click "Save"

4. **Run Schema**
   - Click on the `rateslookup` database
   - Click "Tools" → "Query Tool"
   - Click "Open File" icon
   - Navigate to your project: `E:\srtc\src\database\index.sql`
   - Click "Execute" (F5 or play button)
   - Wait for completion (should see "Query returned successfully")

### Option B: Using Command Line

1. **Open PowerShell as Administrator**

2. **Connect to PostgreSQL**
```powershell
psql -U postgres
```
Enter your password when prompted.

3. **Create Database**
```sql
CREATE DATABASE rateslookup;
\q
```

4. **Run Schema**
```powershell
cd E:\srtc
psql -U postgres -d rateslookup -f src/database/index.sql
```

## Step 5: Update .env File

Edit your `.env` file in the project root:

```env
# Update these lines with your PostgreSQL password
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/rateslookup
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE
```

**Replace `YOUR_PASSWORD_HERE` with the password you set during installation!**

Example:
```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/rateslookup
DB_USER=postgres
DB_PASSWORD=postgres123
```

## Step 6: Verify Setup

Run the setup test:
```powershell
npm run test:setup
```

You should see:
- ✅ Node.js Version
- ✅ Environment Variables
- ✅ Dependencies
- ✅ Database Connection
- ✅ Database Tables (19 tables)
- ✅ Server Configuration

## Step 7: Start the Server

```powershell
npm run dev
```

Or double-click: `start-dev.bat`

The server should start on: http://localhost:3000

## Verify Everything Works

### Test 1: Health Check
Open browser: http://localhost:3000/health

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-27T...",
  "uptime": 1.234,
  "environment": "development"
}
```

### Test 2: API Documentation
Open browser: http://localhost:3000/api/docs

Should show API endpoint documentation.

### Test 3: Create a Lead
```powershell
curl -X POST http://localhost:3000/api/v1/leads -H "Content-Type: application/json" -d '{\"first_name\":\"John\",\"email\":\"john@example.com\",\"phone\":\"1234567890\"}'
```

Or use Postman/Insomnia to test the API.

## Troubleshooting

### Issue: "psql is not recognized"
**Solution**: 
1. Add PostgreSQL to PATH (see Step 3)
2. Restart PowerShell/Terminal
3. Try again

### Issue: "password authentication failed"
**Solution**:
1. Check your password in .env file
2. Try connecting with pgAdmin to verify password
3. Reset password if needed:
   ```sql
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Issue: "database does not exist"
**Solution**:
1. Create database using pgAdmin or command line
2. Run: `createdb -U postgres rateslookup`

### Issue: "could not connect to server"
**Solution**:
1. Check if PostgreSQL service is running:
   - Services → postgresql-x64-16 → Start
2. Check port 5432 is not blocked by firewall

### Issue: "relation does not exist"
**Solution**:
1. Run the database schema:
   ```powershell
   psql -U postgres -d rateslookup -f src/database/index.sql
   ```

## PostgreSQL Service Management

### Start PostgreSQL Service
```powershell
# Using Services
services.msc → postgresql-x64-16 → Start

# Or using command line (as Administrator)
net start postgresql-x64-16
```

### Stop PostgreSQL Service
```powershell
net stop postgresql-x64-16
```

### Check Service Status
```powershell
Get-Service postgresql-x64-16
```

## Useful PostgreSQL Commands

### Connect to Database
```powershell
psql -U postgres -d rateslookup
```

### List Databases
```sql
\l
```

### List Tables
```sql
\dt
```

### Describe Table
```sql
\d mortgage_applications
```

### View Data
```sql
SELECT * FROM lead_captures LIMIT 10;
```

### Exit psql
```sql
\q
```

## Next Steps

Once PostgreSQL is set up:

1. ✅ Run `npm run test:setup` to verify
2. ✅ Start server with `npm run dev`
3. ✅ Test API endpoints
4. 🚀 Start building your frontend!

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgAdmin Documentation: https://www.pgadmin.org/docs/
- SQL Tutorial: https://www.postgresql.org/docs/current/tutorial.html

## Support

If you encounter issues:
1. Check PostgreSQL service is running
2. Verify credentials in .env
3. Check PostgreSQL logs: `C:\Program Files\PostgreSQL\16\data\log`
4. Try connecting with pgAdmin first to isolate the issue