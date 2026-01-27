# PostgreSQL Database Setup Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Database Setup" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Add PostgreSQL to PATH for this session
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"

# Check PostgreSQL installation
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $version = psql --version
    Write-Host "✅ $version" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found" -ForegroundColor Red
    Write-Host "Please ensure PostgreSQL is installed" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   IMPORTANT: PostgreSQL Password" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "You will be prompted for the PostgreSQL password." -ForegroundColor White
Write-Host "Common defaults: 'postgres' or the password you set during installation`n" -ForegroundColor Gray

# Prompt for password
$password = Read-Host "Enter PostgreSQL password for user 'postgres'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for psql
$env:PGPASSWORD = $plainPassword

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Step 1: Creating Database" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    createdb -U postgres rateslookup 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database 'rateslookup' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database might already exist (this is OK)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Database creation issue (might already exist)" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Step 2: Running Database Schema" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "Importing schema (19 tables)..." -ForegroundColor White

try {
    psql -U postgres -d rateslookup -f src/database/index.sql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Schema imported successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Schema import failed" -ForegroundColor Red
        Write-Host "Please check the error messages above" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "`n❌ Schema import failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Step 3: Verifying Installation" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Tables created:" -ForegroundColor White
psql -U postgres -d rateslookup -c "\dt" -q

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ✅ Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your PostgreSQL password" -ForegroundColor White
Write-Host "   DATABASE_URL=postgresql://postgres:$plainPassword@localhost:5432/rateslookup" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=$plainPassword" -ForegroundColor Gray
Write-Host "`n2. Run: npm run test:setup" -ForegroundColor White
Write-Host "3. Run: npm run dev`n" -ForegroundColor White

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")