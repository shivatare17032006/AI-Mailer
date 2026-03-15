# Quick Start Script for SuperBFSI Campaign Manager
# Run this script to start both backend and frontend

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SuperBFSI AI Campaign Manager               ║" -ForegroundColor Cyan
Write-Host "║   Quick Start Script                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".\server\.env")) {
    Write-Host "❌ Error: server\.env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to server\.env and configure it." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run this command:" -ForegroundColor Yellow
    Write-Host "  copy .env.example server\.env" -ForegroundColor White
    Write-Host ""
    pause
    exit
}

# Check if node_modules exist
if (-not (Test-Path ".\server\node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    Set-Location server
    npm install
    Set-Location ..
}

if (-not (Test-Path ".\client\node_modules")) {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Yellow
    Set-Location client
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🚀 Starting servers..." -ForegroundColor Green
Write-Host ""

# Start backend in new window
Write-Host "▶️  Starting Backend Server (Port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Write-Host "▶️  Starting Frontend Server (Port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm start"

Write-Host ""
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "📌 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Browser will open automatically in a few seconds..." -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop servers: Close the PowerShell windows" -ForegroundColor Gray
Write-Host ""
pause
