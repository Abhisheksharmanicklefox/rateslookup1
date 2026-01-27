# Push to GitHub Script
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🚀 Push to GitHub Helper 🚀                    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📝 Repository: https://github.com/Abhisheksharmanicklefox/rateslookup" -ForegroundColor Yellow
Write-Host "`n🔐 You need a Personal Access Token to push." -ForegroundColor Yellow
Write-Host "`nTo create one:" -ForegroundColor White
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host "2. Click 'Generate new token (classic)'" -ForegroundColor Cyan
Write-Host "3. Select 'repo' scope" -ForegroundColor Cyan
Write-Host "4. Generate and copy the token`n" -ForegroundColor Cyan

$token = Read-Host "Enter your Personal Access Token (or press Enter to skip)"

if ($token) {
    Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Cyan
    
    $env:Path += ";C:\Program Files\Git\cmd"
    
    # Push using token
    git push https://${token}@github.com/Abhisheksharmanicklefox/rateslookup.git main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "`n🌐 Your repository is now live at:" -ForegroundColor Yellow
        Write-Host "   https://github.com/Abhisheksharmanicklefox/rateslookup`n" -ForegroundColor Cyan
        
        Write-Host "📊 What was uploaded:" -ForegroundColor Yellow
        Write-Host "   • 61 files" -ForegroundColor Green
        Write-Host "   • Complete backend code" -ForegroundColor Green
        Write-Host "   • 18 documentation files" -ForegroundColor Green
        Write-Host "   • Database schema" -ForegroundColor Green
        Write-Host "   • Development tools`n" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Push failed. Please check your token and try again." -ForegroundColor Red
        Write-Host "See PUSH_TO_GITHUB.md for detailed instructions.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n📖 Manual push command:" -ForegroundColor Yellow
    Write-Host "   git push https://YOUR_TOKEN@github.com/Abhisheksharmanicklefox/rateslookup.git main`n" -ForegroundColor Cyan
    Write-Host "Replace YOUR_TOKEN with your Personal Access Token`n" -ForegroundColor Gray
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")