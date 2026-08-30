# 🏗️ SkyFlow Flight Booking System — Architecture & Sequence Diagrams

> 💡 **Tip to View Visual Diagrams in VS Code:**
> - Press **`Ctrl + Shift + V`** (or **`Ctrl + K` then `V`**) to open the Markdown Preview.
> - Or click the **Open Preview to the Side** icon (📑🔍) in the top-right corner of the editor.

---

## 📌 1. High-Level System Architecture & Tech Stack Connections

SkyFlow is built on a clean multi-tiered architecture connecting modern frontend, enterprise backend, persistent database, local LLM engines, Claude Desktop MCP, and ChatGPT Actions.

```mermaid
flowchart TB
    subgraph Client_Layer ["Client & Frontend Layer (Angular 18 / Port 4200)"]
        UI["Angular SPA<br/>(HTML5, SCSS, RxJS)"]
        AUTH_G["Auth & Admin Route Guards<br/>(auth.guard.ts, admin.guard.ts)"]
        CLIENT_STORE["LocalStorage Token Store<br/>(JWT Bearer)"]
    end

    subgraph AI_Clients ["External AI Clients"]
        CLAUDE["Claude Desktop App<br/>(Local MCP Host)"]
        CHATGPT["ChatGPT Cloud<br/>(Custom GPT Action)"]
    end

    subgraph Middleware_Bridge ["Integration & Tunnel Layer"]
        MCP_BRIDGE["Node.js MCP Server<br/>(claude-mcp-server.js / stdio JSON-RPC)"]
        CLOUDFLARE["Cloudflare HTTPS Tunnel<br/>(cloudflared / trycloudflare.com)"]
    end

    subgraph Backend_Layer ["Spring Boot 3 Backend Service (Java 17 / Port 8080)"]
        SECURITY["Spring Security Filter Chain<br/>(JwtAuthFilter, BCrypt, SecurityConfig)"]
        REST_CTRL["REST API Controllers<br/>(AuthController, FlightController, BookingController, AdminController, PaymentController)"]
        MCP_CTRL["MCP Controller<br/>(/api/mcp/call, /api/mcp/tools)"]
        GPT_CTRL["ChatGPT Action Controller<br/>(/api/chatgpt/*)"]
        SVC_LAYER["Business Services Layer<br/>(FlightServiceImpl, BookingServiceImpl, UserServiceImpl, CouponServiceImpl, ChatbotServiceImpl)"]
        JPA_REPO["Spring Data JPA Repositories<br/>(FlightRepo, BookingRepo, UserRepo, AirportRepo, CouponRepo, PaymentRepo)"]
    end

    subgraph Storage_AI_Layer ["Data Persistence & Local AI Layer"]
        PGDB[("PostgreSQL 14 Database<br/>(Port 5432 / Flyway Migrations)")]
        OLLAMA["Local Ollama Engine<br/>(Port 11434 / llama3.2:1b)"]
    end

    UI -->|HTTP REST APIs + JWT Header| SECURITY
    CLIENT_STORE <--> UI
    CLAUDE -->|stdio JSON-RPC 2.0| MCP_BRIDGE
    MCP_BRIDGE -->|POST /api/mcp/call| MCP_CTRL
    CHATGPT -->|HTTPS OpenAPI Requests| CLOUDFLARE
    CLOUDFLARE --> GPT_CTRL

    SECURITY --> REST_CTRL
    REST_CTRL --> SVC_LAYER
    MCP_CTRL --> SVC_LAYER
    GPT_CTRL --> SVC_LAYER

    SVC_LAYER --> JPA_REPO
    SVC_LAYER -->|HTTP POST /api/chat| OLLAMA
    JPA_REPO -->|Hibernate SQL / ORM| PGDB
```

---

## 🌐 2. End-to-End System Workflow Sequence Diagram

This diagram shows the complete user lifecycle from landing on the website to logging in, searching flights, completing a booking, and downloading an e-ticket.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Traveler
    participant UI as Angular 18 Web UI
    participant Auth as Auth & Security Filter
    participant FlightBE as Flight Service
    participant BookingBE as Booking & Payment Service
    participant DB as PostgreSQL Database
    participant AI as Claude / Ollama AI

    Customer->>UI: 1. Open SkyFlow Web App (http://localhost:4200)
    Customer->>UI: 2. Enter Login Credentials (email & password)
    UI->>Auth: POST /api/auth/login
    Auth->>DB: Validate user & verify BCrypt hash
    DB-->>Auth: User record valid
    Auth-->>UI: Return signed JWT token & user profile
    UI->>UI: Store JWT in LocalStorage

    Customer->>UI: 3. Search Flights (Origin: DEL, Dest: BOM, Date, Class)
    UI->>FlightBE: GET /api/flights/search?origin=DEL&destination=BOM...
    FlightBE->>DB: Query scheduled flights with available seats
    DB-->>FlightBE: Matching flights list
    FlightBE-->>UI: Return flight listings JSON
    UI-->>Customer: Display interactive flight cards with filters & pricing

    Customer->>UI: 4. Select Flight & Fill Passenger Info (DOB, Seat, Meal)
    UI->>UI: Auto-calculate Age & Passenger Category from DOB
    Customer->>UI: 5. Apply Promo Coupon (e.g. SKYFLOW500)
    UI->>BookingBE: Validate coupon & calculate discounted total
    
    Customer->>UI: 6. Submit Booking & Complete Payment
    UI->>BookingBE: POST /api/bookings (Passenger data + Payment method)
    BookingBE->>DB: Generate unique PNR & insert Booking + Payment records
    DB-->>BookingBE: Records saved successfully
    BookingBE-->>UI: Return Booking Confirmation (PNR, Ticket numbers)
    UI-->>Customer: Show Interactive Itinerary Modal & Downloadable PDF E-Ticket

    opt Ask AI Assistant
        Customer->>UI: 7. Ask "What is my baggage allowance?"
        UI->>AI: Query MCP Tool / Ollama LLM
        AI-->>UI: Return instant policy details (15kg Economy / 25kg Business)
        UI-->>Customer: Display assistant response in chat widget
    end
```

---

## 🔐 3. Authentication & Role-Based Authorization Sequence Diagram

Details user authentication, JWT generation, local storage persistence, and role-based routing (`ROLE_ADMIN` vs `ROLE_USER`).

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer / Admin
    participant UI as Angular Frontend
    participant Filter as JwtAuthFilter
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthServiceImpl
    participant UserRepo as UserRepository
    participant JWT as JwtUtil
    participant DB as PostgreSQL DB

    User->>UI: Enter Email & Password
    UI->>AuthCtrl: POST /api/auth/login {email, password}
    AuthCtrl->>AuthSvc: authenticate(loginDTO)
    AuthSvc->>UserRepo: findByEmail(email)
    UserRepo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>UserRepo: Return User Entity
    UserRepo-->>AuthSvc: User Details with Password Hash
    
    AuthSvc->>AuthSvc: BCrypt.checkpw(rawPassword, encodedPassword)
    alt Invalid Credentials
        AuthSvc-->>AuthCtrl: Throw BadCredentialsException
        AuthCtrl-->>UI: HTTP 401 Unauthorized
        UI-->>User: Show "Invalid Email or Password" Toast
    else Valid Credentials
        AuthSvc->>JWT: generateToken(UserDetails)
        JWT-->>AuthSvc: Signed JWT String (HMAC-SHA256)
        AuthSvc-->>AuthCtrl: AuthResponse {token, role, name, email}
        AuthCtrl-->>UI: HTTP 200 OK + JWT Token Payload
        UI->>UI: Save Token to LocalStorage & Set Current User State
        
        alt Role == "ROLE_ADMIN"
            UI-->>User: Navigate to /admin (Admin Operations Control)
        else Role == "ROLE_USER"
            UI-->>User: Navigate to / (Flight Search Dashboard)
        end
    end

    Note over User, DB: Subsequent Protected Requests (e.g. Booking, Admin APIs)
    User->>UI: Request Protected Action
    UI->>Filter: HTTP Request (Header: "Authorization: Bearer JWT")
    Filter->>JWT: extractUsername(token) & validateToken(token)
    JWT-->>Filter: Token is Valid & Claims Extracted
    Filter->>Filter: Set SecurityContextHolder with User Authorities
    Filter->>AuthCtrl: Proceed to Target Controller Endpoint
```

---

## ✈️ 4. Flight Search & Dynamic Filter Pipeline Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Traveler
    participant SearchUI as Flight Search & Filter Panel
    participant FlightSvcFE as FlightService (Angular)
    participant FlightCtrl as FlightController (Spring Boot)
    participant FlightSvcBE as FlightServiceImpl
    participant FlightRepo as FlightRepository
    participant DB as PostgreSQL DB

    Traveler->>SearchUI: Select Origin (DEL), Destination (BOM), Travel Date & Cabin Class
    Traveler->>SearchUI: Adjust Multi-Filters (Max Price, Preferred Airlines, Stops)
    SearchUI->>FlightSvcFE: searchFlights(origin, destination, date, cabinClass)
    FlightSvcFE->>FlightCtrl: GET /api/flights/search?origin=DEL&destination=BOM&date=...
    FlightCtrl->>FlightSvcBE: searchFlights(origin, destination, date, cabinClass)
    FlightSvcBE->>FlightRepo: findFlights(origin, destination, date, status='SCHEDULED')
    FlightRepo->>DB: SELECT * FROM flights f WHERE f.origin=? AND f.destination=? AND f.status='SCHEDULED'
    DB-->>FlightRepo: List of Flight Entities with Airline & Schedule Data
    FlightRepo-->>FlightSvcBE: List<Flight>
    FlightSvcBE->>FlightSvcBE: Map to FlightDTOs with available seat counts
    FlightSvcBE-->>FlightCtrl: List<FlightDTO>
    FlightCtrl-->>FlightSvcFE: HTTP 200 OK (JSON Flight List)
    
    Note over SearchUI: Client-Side Dynamic Sorting & Filtering
    SearchUI->>SearchUI: Apply Price Slider, Airline checkboxes, Direct/1-Stop filters
    SearchUI->>SearchUI: Sort by Lowest Price / Earliest Time / Duration
    SearchUI-->>Traveler: Render dynamic cards with flight timings, duration, airline logos & fares
```

---

## 💳 5. Booking Creation, Age Computation & Payment Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Passenger
    participant BookUI as Booking Component (/booking)
    participant CouponBE as CouponService
    participant BookCtrl as BookingController
    participant BookSvc as BookingServiceImpl
    participant PayCtrl as PaymentController
    participant PaySvc as PaymentServiceImpl
    participant DB as PostgreSQL DB

    Passenger->>BookUI: Enter Passenger Details (Full Name, Date of Birth, Gender, Passport/Gov ID)
    BookUI->>BookUI: Automated DOB to Age computation: Age = (Today - DOB) in years
    BookUI->>BookUI: Assign Category: Infant (<2 yrs), Child (2-11 yrs), Adult (12+ yrs)
    Passenger->>BookUI: Select Seat Preference (Window/Aisle) & Meal (Veg/Non-Veg/Jain)

    opt Apply Promo Discount
        Passenger->>BookUI: Enter Promo Code (e.g. SKYFLOW500)
        BookUI->>CouponBE: GET /api/coupons/validate?code=SKYFLOW500
        CouponBE->>DB: Query coupon validity, expiry & minimum amount
        DB-->>CouponBE: Coupon Active (Discount: ₹500)
        CouponBE-->>BookUI: Return discount amount & update grand total
    end

    Passenger->>BookUI: Choose Payment Mode (Credit Card, Debit Card, UPI, Net Banking) & Submit
    BookUI->>BookCtrl: POST /api/bookings (BookingDTO + Passenger List)
    BookCtrl->>BookSvc: createBooking(bookingDTO, authenticatedUser)
    BookSvc->>BookSvc: Generate Unique PNR (e.g. SKF-783921) & Ticket Numbers
    BookSvc->>DB: INSERT INTO bookings (pnr, user_id, status='PENDING', total_amount)
    BookSvc->>DB: INSERT INTO passengers (booking_id, name, age, passenger_type, seat, meal)
    DB-->>BookSvc: Booking & Passenger records saved
    BookSvc-->>BookCtrl: Saved Booking Entity
    BookCtrl-->>BookUI: HTTP 201 Created (Booking Pending)

    BookUI->>PayCtrl: POST /api/payments/process {bookingId, amount, paymentMethod}
    PayCtrl->>PaySvc: processPayment(...)
    PaySvc->>DB: INSERT INTO payments (booking_id, amount, status='SUCCESS', transaction_id)
    PaySvc->>DB: UPDATE bookings SET status='CONFIRMED' WHERE id=bookingId
    DB-->>PaySvc: Payment & Booking updated
    PaySvc-->>PayCtrl: Payment Successful DTO
    PayCtrl-->>BookUI: HTTP 200 OK
    BookUI-->>Passenger: Display Confirmed Booking Modal with PNR & PDF E-Ticket
```

---

## 📄 6. Booking Management, Itinerary & Cancellation Lifecycle Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant TripsUI as "My Bookings" Dashboard (/bookings)
    participant ModalUI as Itinerary Modal Popup
    participant BookCtrl as BookingController
    participant BookSvc as BookingServiceImpl
    participant DB as PostgreSQL DB

    Customer->>TripsUI: Open "My Bookings"
    TripsUI->>BookCtrl: GET /api/bookings/my-bookings (Bearer JWT)
    BookCtrl->>BookSvc: getUserBookings(currentUser)
    BookSvc->>DB: SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC
    DB-->>BookSvc: List of Bookings with Passengers & Flight details
    BookSvc-->>BookCtrl: List<BookingDTO>
    BookCtrl-->>TripsUI: HTTP 200 OK
    TripsUI-->>Customer: Display Active Trips & Past Travel History

    alt View Itinerary & Print Ticket
        Customer->>TripsUI: Click "View Itinerary"
        TripsUI->>ModalUI: Open Modal with full Flight Route, PNR, and Passenger Seats
        ModalUI-->>Customer: Show Rich Itinerary
        Customer->>ModalUI: Click "Print / Save PDF"
        ModalUI->>ModalUI: Trigger window.print() formatted e-ticket view
    else Cancel Booking
        Customer->>TripsUI: Click "Cancel Flight"
        TripsUI->>BookCtrl: POST /api/bookings/{id}/cancel
        BookCtrl->>BookSvc: cancelBooking(bookingId, currentUser)
        BookSvc->>BookSvc: Calculate cancellation window (24 hr free vs 20% fee)
        BookSvc->>DB: UPDATE bookings SET status='CANCELLED' WHERE id=?
        BookSvc->>DB: UPDATE flights SET available_seats = available_seats + seats WHERE id=?
        DB-->>BookSvc: Booking cancelled & seats released
        BookSvc-->>BookCtrl: Cancellation Confirmation + Refund Details
        BookCtrl-->>TripsUI: HTTP 200 OK
        TripsUI-->>Customer: Show "Booking Cancelled & Refund Initiated" Toast
    end
```

---

## 🛡️ 7. Admin Operations & Fleet Control Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminUI as Admin Console (/admin)
    participant AdminCtrl as AdminController / FlightController
    participant FlightSvc as FlightServiceImpl
    participant DB as PostgreSQL DB

    Admin->>AdminUI: Open Admin Console
    AdminUI->>AdminCtrl: GET /api/admin/diagnostics
    AdminCtrl->>DB: Check DB Connection & Query Count
    AdminCtrl-->>AdminUI: Health Metrics (DB Status, Spring Boot Uptime, Ollama Status)

    alt 1. Create New Flight Route
        Admin->>AdminUI: Fill Route Form (Airline, Flight No, DEL->BOM, Departure, Arrival, Price, Seats)
        AdminUI->>AdminCtrl: POST /api/admin/flights
        AdminCtrl->>FlightSvc: createFlight(flightDTO)
        FlightSvc->>DB: INSERT INTO flights (flight_number, origin, destination, departure, arrival, price, seats)
        DB-->>FlightSvc: Flight entity created
        FlightSvc-->>AdminCtrl: FlightDTO
        AdminCtrl-->>AdminUI: HTTP 201 Created
        AdminUI-->>Admin: Show Success Toast & Refresh Route Table
    else 2. Cycle Flight Status
        Admin->>AdminUI: Change Status (SCHEDULED ➔ BOARDING ➔ DELAYED ➔ COMPLETED)
        AdminUI->>AdminCtrl: PATCH /api/flights/{id}/status?status=DELAYED
        AdminCtrl->>FlightSvc: updateStatus(id, DELAYED)
        FlightSvc->>DB: UPDATE flights SET status='DELAYED' WHERE id=?
        DB-->>FlightSvc: Updated Entity
        FlightSvc-->>AdminCtrl: Updated FlightDTO
        AdminCtrl-->>AdminUI: HTTP 200 OK
        AdminUI-->>Admin: Real-time status badge updated to DELAYED
    else 3. Toggle Fleet Maintenance
        Admin->>AdminUI: Toggle Aircraft Status (VT-IFG: Operational ➔ In Maintenance)
        AdminUI->>AdminUI: Update Fleet Readiness metric in UI
        AdminUI-->>Admin: Fleet readiness recalculated
    end
```

---

## 🤖 8. Claude Desktop MCP Tool Invocation Sequence Diagram

This diagram demonstrates how **Claude Desktop** executes local database queries via **Model Context Protocol (MCP)** standard stdio interface.

```mermaid
sequenceDiagram
    autonumber
    actor User Prompt
    participant Claude as Claude Desktop App
    participant Config as claude_desktop_config.json
    participant NodeMCP as claude-mcp-server.js (Node.js stdio)
    participant McpCtrl as McpController (Spring Boot :8080)
    participant ToolSvc as McpFlightToolService
    participant DB as PostgreSQL Database

    User Prompt->>Claude: Ask "Show live flights from Delhi (DEL) to Mumbai (BOM) on SkyFlow"
    Claude->>Config: Check registered MCP servers ("skyflow-flights")
    Claude->>NodeMCP: JSON-RPC 2.0 over stdio (tools/call: search_flights)
    
    NodeMCP->>McpCtrl: HTTP POST http://localhost:8080/api/mcp/call
    McpCtrl->>ToolSvc: executeTool("search_flights", args)
    ToolSvc->>DB: SELECT * FROM flights WHERE origin='DEL' AND destination='BOM'
    DB-->>ToolSvc: Live Flight Records (Indigo 6E-204, Air India AI-102, etc.)
    ToolSvc->>ToolSvc: Format Markdown Schedule Table with Airline, Timings & Fares
    ToolSvc-->>McpCtrl: Formatted Table String
    McpCtrl-->>NodeMCP: HTTP 200 OK JSON (Formatted Flight List)
    NodeMCP-->>Claude: JSON-RPC 2.0 Result Payload
    Claude-->>User Prompt: Render rich interactive flight table in Claude chat!
```

---

## 🌐 9. ChatGPT Custom GPT Action Integration Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor ChatGPT User
    participant GPT as ChatGPT Web / Mobile App
    participant Tunnel as Cloudflare HTTPS Tunnel (trycloudflare.com)
    participant GPTCtrl as ChatGptActionController (:8080)
    participant ToolSvc as McpFlightToolService
    participant DB as PostgreSQL DB

    ChatGPT User->>GPT: Ask "What is the cancellation refund policy on SkyFlow?"
    GPT->>GPT: Inspect OpenAPI Schema (chatgpt-action-openapi.json)
    GPT->>Tunnel: HTTPS POST https://xxxx.trycloudflare.com/api/chatgpt/cancellation-policy
    Tunnel->>GPTCtrl: Proxy request to http://localhost:8080/api/chatgpt/cancellation-policy
    GPTCtrl->>ToolSvc: executeTool("get_cancellation_policy")
    ToolSvc-->>GPTCtrl: "Free cancellation within 24 hours. 20% fee thereafter. 3-5 day refund."
    GPTCtrl-->>Tunnel: HTTP 200 OK JSON Response
    Tunnel-->>GPT: Forward JSON Response
    GPT-->>ChatGPT User: Display natural language explanation with official policy terms
```

---

## 🧠 10. Local Ollama AI Chatbot & Fast-Path Guardrail Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant ChatWidget as Web Chat Assistant (/assistant)
    participant ChatSvc as ChatbotServiceImpl
    participant ToolSvc as McpFlightToolService
    participant Ollama as Local Ollama Service (:11434 / llama3.2:1b)

    Customer->>ChatWidget: Types "What is the cabin baggage limit for Business class?"
    ChatWidget->>ChatSvc: POST /api/chat {message: "What is the cabin baggage limit..."}
    ChatSvc->>ChatSvc: Evaluate Domain Guardrail (Reject trains, buses, ships, off-topic)

    alt Intent matches non-flight transport (Train / Bus)
        ChatSvc-->>ChatWidget: "I only assist with SkyFlow flights and air travel policies."
    else Flight Intent with Fast-Path Match
        ChatSvc->>ToolSvc: executeTool("get_baggage_allowance")
        ToolSvc-->>ChatSvc: Policy Text: "Economy: 15kg check-in, 7kg cabin. Business: 25kg check-in, 10kg cabin." (<15ms)
        ChatSvc->>Ollama: POST http://localhost:11434/api/chat (System Prompt + Policy Context + User Query)
        Ollama-->>ChatSvc: Natural conversational response generated
        ChatSvc-->>ChatWidget: Final formatted message
        ChatWidget-->>Customer: Display instant AI assistant reply
    end
```
