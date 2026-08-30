# 🔌 SkyFlow Model Context Protocol (MCP) Documentation

This document contains the **Model Context Protocol (MCP)** server configuration and tool specifications for the SkyFlow Flight Booking System.

---

## 📌 What is MCP in this Project?

The **Model Context Protocol (MCP)** allows AI assistants (Ollama `llama3.2:1b`, Claude Desktop, Antigravity, VS Code, Cursor) to safely query real-time flight database tools from the backend.

### Registered Live Database Tools:
1. **`search_flights`**: Queries active flights from PostgreSQL by origin & destination (e.g. `DEL` to `BOM`).
2. **`get_baggage_allowance`**: Returns check-in and cabin baggage rules (15 Kg Economy / 25 Kg Business).
3. **`get_cancellation_policy`**: Returns free cancellation window (24 hrs), late fee (20%), and refund timelines (3–5 days).
4. **`get_airports_list`**: Returns all operational airport hubs (DEL, BOM, BLR, MAA, HYD, etc.).
5. **`get_passenger_age_rules`**: Returns automated DOB age calculation rules and passenger type categories.

---

## 🌐 MCP Server Endpoints

| Protocol / Method | URL Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `http://localhost:8080/api/mcp/tools` | Discovers all available tools with JSON Schema definitions |
| **POST** | `http://localhost:8080/api/mcp/call` | Executes an MCP tool by name and arguments |
| **POST (JSON-RPC 2.0)** | `http://localhost:8080/api/mcp/rpc` | Standard MCP JSON-RPC 2.0 protocol endpoint |

---

## 🧪 Testing the MCP Server

You can run the PowerShell script `test-mcp-client.ps1` in the `mcp/` folder:
```powershell
./mcp/test-mcp-client.ps1
```

Or test directly with curl / PowerShell:
```powershell
# List Tools
Invoke-RestMethod -Uri "http://localhost:8080/api/mcp/tools" -Method Get

# Call Flight Search Tool
$body = @{
    name = "search_flights"
    arguments = @{ origin = "DEL"; destination = "BOM" }
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/mcp/call" -Method Post -ContentType "application/json" -Body $body
```
