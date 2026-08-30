# How to Connect SkyFlow as a ChatGPT Plugin / Custom GPT Action

This guide explains how to integrate your **SkyFlow Flight Assistant** directly into **ChatGPT** as a **Custom GPT Action** (the modern standard that replaced legacy plugins).

---

## 🌟 What This Allows ChatGPT to Do

Once connected, you can chat with ChatGPT on your computer or phone, and ChatGPT will call your SkyFlow backend in real-time to:
1. ✈️ **Search Live Flights**: *"Find flights from Delhi to Mumbai on IndiGo or Air India."*
2. 🧳 **Check Baggage Rules**: *"What is the baggage limit for Economy vs Business?"*
3. 🔄 **Check Cancellation Policies**: *"What is the refund if I cancel 12 hours before flight?"*
4. 🏢 **Airport Lookups**: *"What airports are supported in SkyFlow?"*
5. 🛡️ **Guardrail Enforcement**: Reject train, ship, or unrelated queries automatically.

---

## 🛠️ Step 1: Start Your Cloud Tunnel (1-Click)

Because ChatGPT runs in the cloud, it needs a public HTTPS URL to reach your local Spring Boot backend (Port `8080`).

We have placed `cloudflared.exe` directly inside your project folder!

### Simply run this command in your project terminal:
```powershell
.\cloudflared.exe tunnel --url http://localhost:8080
```
*(Or double-click `start-chatgpt-tunnel.bat`)*

Look for the line in the terminal showing:
```text
https://xxxx-xxxx-xxxx.trycloudflare.com
```
👉 **Copy that HTTPS URL!**

---

## 🤖 Step 2: Create the Custom GPT in ChatGPT

1. Open [chatgpt.com](https://chatgpt.com/) and click **Explore GPTs** in the sidebar.
2. Click **+ Create** (top right) and switch to the **Configure** tab.
3. Fill in the fields:
   - **Name**: `SkyFlow Flight Assistant`
   - **Description**: `AI Flight Guide for live flight schedules, baggage policies, and ticket booking support.`
   - **Instructions**:
     ```text
     You are SkyFlow AI Guide, the dedicated virtual assistant for SkyFlow Flight Booking System.
     
     CAPABILITIES:
     - Search live flights, schedules, fares, and available seats between Indian airport hubs (DEL, BOM, BLR, MAA, HYD, CCU, COK, PNQ, AMD, GOI).
     - Provide official baggage allowances and cancellation refund timelines.
     
     STRICT DOMAIN RESTRICTIONS:
     - You ONLY answer questions related to flights, airlines, baggage rules, ticket cancellations, and airports.
     - If the user asks about Train (IRCTC, railway), Ship (cruise, ferry), or Bus journeys, refuse politely:
       "I only provide assistance for flights and air travel. I cannot assist with train, ship, or bus journeys."
     - For non-travel topics (code, cooking, math, trivia), refuse politely.
     ```

---

## 🔌 Step 3: Add the Action Schema

1. Scroll down to the bottom of the GPT configuration page and click **Create new action**.
2. Open [`mcp/chatgpt-action-openapi.json`](./chatgpt-action-openapi.json).
3. Replace the URL on line 10 with your `.trycloudflare.com` URL from Step 1:
   ```json
   "servers": [
     {
       "url": "https://xxxx-xxxx-xxxx.trycloudflare.com"
     }
   ]
   ```
4. Paste the entire JSON into the **Schema** box in ChatGPT.
5. Under **Authentication**, choose **None**.
6. The 5 tools (`searchFlights`, `getBaggagePolicy`, `getCancellationPolicy`, `getAirportsList`, `getPassengerRules`) will appear!

---

## 🚀 Step 4: Test Live in ChatGPT!

In the **Preview** panel on the right side of ChatGPT:
1. Type: *"Show me available flights from Delhi (DEL) to Mumbai (BOM)"*
2. ChatGPT will ask permission to access your tunnel ➔ Click **Always Allow**.
3. ChatGPT will fetch live flights from your local PostgreSQL database!
4. Type: *"Can you book a train for me?"* ➔ ChatGPT will trigger the flight-only guardrail!
5. Click **Save** / **Publish** (to "Only me").
