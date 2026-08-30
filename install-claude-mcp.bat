@echo off
title SkyFlow Claude MCP Installer
echo ============================================================
echo   SkyFlow Flight Assistant - Claude Desktop MCP Installer
echo ============================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0install-claude-mcp.ps1"
echo.
pause
