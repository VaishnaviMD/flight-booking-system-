# 🤖 How to Connect SkyFlow to Claude Desktop (100% Free MCP)

**Claude Desktop** by Anthropic is the official host for the **Model Context Protocol (MCP)** and supports local tool calling for **free**!

---

## ⚡ 1-Click Setup

We have created a 1-click installer script that automatically configures Claude Desktop for you!

1. Open PowerShell or Command Prompt in your project folder and run:
   ```powershell
   .\install-claude-mcp.bat
   ```
   *(Or run `powershell -ExecutionPolicy Bypass -File install-claude-mcp.ps1`)*

2. You will see:
   ```text
   [SUCCESS] SkyFlow MCP Server configured for Claude Desktop!
   ```

---

## 🚀 How to Use in Claude Desktop

1. **Install Claude Desktop**: If you haven't installed it yet, download it from [claude.ai/download](https://claude.ai/download).
2. **Start your SkyFlow Backend**: Ensure your Spring Boot backend is running (`mvn spring-boot:run -f backend/pom.xml`).
3. **Open or Restart Claude Desktop**.
4. In any chat window in Claude, you will now see a **🔨 (Hammer / Installed Tools)** icon with **5 SkyFlow Flight Tools**:
   - ✈️ `search_flights`: Search live flight schedules, airlines, ticket fares (₹), and seats between Indian cities (e.g. DEL to BOM).
   - 🧳 `get_baggage_allowance`: Check official baggage limits (15kg Economy / 25kg Business).
   - 🔄 `get_cancellation_policy`: Check 24-hr free cancellation and refund rules.
   - 🏢 `get_airports_list`: Check supported Indian airport hubs.
   - 👤 `get_passenger_age_rules`: Check automated DOB-to-Age rules.

---

## 💬 Example Prompts to Ask Claude:

- *"Show me available flights from Delhi (DEL) to Mumbai (BOM) on SkyFlow."*
  - Claude will invoke `search_flights` and present a structured markdown table of live flights with airlines, timings, and ticket prices!
- *"What is the cabin baggage limit on SkyFlow flights?"*
  - Claude will invoke `get_baggage_allowance` and return official airline baggage allowances!
- *"What is the refund if I cancel my ticket 12 hours before departure?"*
  - Claude will invoke `get_cancellation_policy` and explain the 20% cancellation fee and 3–5 day refund processing!
- *"Can you book a train or cruise ticket for me?"*
  - Claude and SkyFlow MCP tools will enforce the air-travel domain guardrail!
