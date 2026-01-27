@echo off
echo ========================================
echo RatesLookup Backend - Development Server
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create .env file with your configuration.
    echo See .env file in the project root for template.
    echo.
    pause
    exit /b 1
)

echo Starting development server...
echo.
echo Server will be available at: http://localhost:3000
echo API Documentation: http://localhost:3000/api/docs
echo Health Check: http://localhost:3000/health
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev