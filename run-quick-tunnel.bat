@echo off
echo Starting Cloudflare Quick Tunnel...
echo.
echo IMPORTANT: Copy the URL that appears and update index.html
echo.
cloudflared tunnel --url http://localhost:8000
pause
