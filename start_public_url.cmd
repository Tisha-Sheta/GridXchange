@echo off
echo ===================================================
echo Starting GridXchange Application ^& Cloudflare Tunnel
echo ===================================================
echo.

start "GridXchange Backend" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul
start "GridXchange Public Tunnel" cmd /c "cloudflared.exe tunnel --url http://localhost:3000"

echo.
echo GridXchange and Public Tunnel started!
echo Check the 'GridXchange Public Tunnel' window for your live URL.
