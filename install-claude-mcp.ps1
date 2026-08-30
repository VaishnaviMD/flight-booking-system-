# SkyFlow Flight Assistant - 1-Click Claude Desktop MCP Installer

$claudeDir = "$env:APPDATA\Claude"
$configFile = "$claudeDir\claude_desktop_config.json"
$serverScript = "$PSScriptRoot\mcp\claude-mcp-server.js"
$nodeExe = "C:\Program Files\nodejs\node.exe"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SkyFlow Flight Assistant - Claude Desktop MCP Installer   " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $nodeExe)) {
    $nodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source
}

if (-not (Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
}

$escapedServerScript = $serverScript.Replace('\', '\\')
$escapedNodeExe = $nodeExe.Replace('\', '\\')

$configContent = @"
{
  "mcpServers": {
    "skyflow-flights": {
      "command": "$escapedNodeExe",
      "args": [
        "$escapedServerScript"
      ]
    }
  }
}
"@

Set-Content -Path $configFile -Value $configContent -Encoding UTF8

Write-Host "[SUCCESS] SkyFlow MCP Server configured for Claude Desktop!" -ForegroundColor Green
Write-Host "Config Path: $configFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Configuration written:" -ForegroundColor Cyan
Write-Host $configContent -ForegroundColor White
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Next Steps:" -ForegroundColor Yellow
Write-Host " 1. Make sure Spring Boot backend is running (mvn spring-boot:run)" -ForegroundColor White
Write-Host " 2. Fully quit Claude Desktop (right-click icon in taskbar tray -> Quit)" -ForegroundColor White
Write-Host " 3. Re-open Claude Desktop" -ForegroundColor White
Write-Host " 4. Look for the Hammer/Tools icon in Claude chat!" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
