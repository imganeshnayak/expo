# Allow Node.js through Windows Firewall for local network access
Write-Host "Adding Windows Firewall rule for Node.js..." -ForegroundColor Cyan

# Find Node.js executable
$nodePath = (Get-Command node).Source

# Add inbound rule for Node.js
New-NetFirewallRule -DisplayName "Node.js Server (Port 5000)" `
    -Direction Inbound `
    -Program $nodePath `
    -Action Allow `
    -Protocol TCP `
    -LocalPort 5000 `
    -Profile Private `
    -Enabled True

Write-Host "✅ Firewall rule added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now testing backend accessibility..." -ForegroundColor Cyan

# Test if backend is accessible
$response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
Write-Host "✅ Backend is running: $($response.status)" -ForegroundColor Green
Write-Host ""
Write-Host "Your phone should now be able to connect to:" -ForegroundColor Yellow
Write-Host "http://192.168.1.104:5000" -ForegroundColor Yellow
