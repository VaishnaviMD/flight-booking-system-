# SkyFlow MCP Client Tester
Write-Host "=== 1. Discovering MCP Tools from http://localhost:8080/api/mcp/tools ===" -ForegroundColor Cyan
$tools = Invoke-RestMethod -Uri "http://localhost:8080/api/mcp/tools" -Method Get
$tools | ForEach-Object {
    Write-Host " [Tool Found] $($_.name) - $($_.description)" -ForegroundColor Green
}

Write-Host "`n=== 2. Calling MCP Tool 'get_baggage_allowance' ===" -ForegroundColor Cyan
$baggageCall = @{ name = "get_baggage_allowance"; arguments = @{} } | ConvertTo-Json
$baggageRes = Invoke-RestMethod -Uri "http://localhost:8080/api/mcp/call" -Method Post -ContentType "application/json" -Body $baggageCall
$baggageRes | Format-List

Write-Host "`n=== 3. Calling MCP Tool 'search_flights' for DEL -> BOM ===" -ForegroundColor Cyan
$flightCall = @{
    name = "search_flights"
    arguments = @{ origin = "DEL"; destination = "BOM" }
} | ConvertTo-Json
$flightRes = Invoke-RestMethod -Uri "http://localhost:8080/api/mcp/call" -Method Post -ContentType "application/json" -Body $flightCall
Write-Host "Total Flights Returned: $($flightRes.flightsCount)" -ForegroundColor Yellow
$flightRes.flights | ForEach-Object {
    Write-Host " -> $($_.airline) ($($_.flightNumber)): $($_.origin) to $($_.destination) - Rs. $($_.price)"
}

Write-Host "`n=== 4. Standard MCP JSON-RPC 2.0 Call 'tools/list' ===" -ForegroundColor Cyan
$rpcList = @{ jsonrpc = "2.0"; id = 101; method = "tools/list"; params = @{} } | ConvertTo-Json
$rpcListRes = Invoke-RestMethod -Uri "http://localhost:8080/api/mcp/rpc" -Method Post -ContentType "application/json" -Body $rpcList
Write-Host "JSON-RPC Result ID: $($rpcListRes.id)" -ForegroundColor Green
Write-Host "Tools count via JSON-RPC: $($rpcListRes.result.tools.Count)" -ForegroundColor Green
