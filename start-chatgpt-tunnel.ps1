Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  SkyFlow Flight Assistant - ChatGPT Cloud Tunnel  " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting secure HTTPS tunnel for Spring Boot on Port 8080..." -ForegroundColor Yellow
Write-Host "Copy the https://...trycloudflare.com link below and paste into ChatGPT Actions!" -ForegroundColor Magenta
Write-Host ""

& "$PSScriptRoot\cloudflared.exe" tunnel --url http://localhost:8080
