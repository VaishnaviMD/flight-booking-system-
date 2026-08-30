@echo off
title SkyFlow ChatGPT Tunnel
echo ===================================================
echo   SkyFlow Flight Assistant - ChatGPT Cloud Tunnel
echo ===================================================
echo.
echo Starting secure HTTPS tunnel for Spring Boot on Port 8080...
echo.
echo [!] Look for the link ending in: .trycloudflare.com
echo [!] Copy that link and paste it into ChatGPT Actions Schema!
echo.
cloudflared.exe tunnel --url http://localhost:8080
pause
