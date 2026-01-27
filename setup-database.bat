@echo off
echo ========================================
echo PostgreSQL Database Setup
echo ========================================
echo.

REM Add PostgreSQL to PATH for this session
set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin

echo Checking PostgreSQL installation...
psql --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL not found in PATH
    echo Please add C:\Program Files\PostgreSQL\16\bin to your PATH
    pause
    exit /b 1
)
echo.

echo ========================================
echo IMPORTANT: PostgreSQL Password
echo ========================================
echo.
echo During installation, a password was set for the 'postgres' user.
echo If you don't remember it, the default is often 'postgres'
echo.
echo You will be prompted for the password in the next steps.
echo.
pause

echo.
echo ========================================
echo Step 1: Creating Database
echo ========================================
echo.
echo Creating database 'rateslookup'...
echo.

createdb -U postgres rateslookup
if %ERRORLEVEL% EQU 0 (
    echo ✅ Database created successfully!
) else (
    echo ⚠️  Database might already exist or password incorrect
)
echo.

echo ========================================
echo Step 2: Running Database Schema
echo ========================================
echo.
echo Importing schema from src/database/index.sql...
echo This will create 19 tables...
echo.

psql -U postgres -d rateslookup -f src/database/index.sql
if %ERRORLEVEL% EQU 0 (
    echo ✅ Schema imported successfully!
) else (
    echo ❌ Schema import failed
    echo Please check the error messages above
    pause
    exit /b 1
)
echo.

echo ========================================
echo Step 3: Verifying Installation
echo ========================================
echo.
echo Checking tables...
echo.

psql -U postgres -d rateslookup -c "\dt"
echo.

echo ========================================
echo ✅ Database Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update your .env file with the PostgreSQL password
echo 2. Run: npm run test:setup
echo 3. Run: npm run dev
echo.
pause