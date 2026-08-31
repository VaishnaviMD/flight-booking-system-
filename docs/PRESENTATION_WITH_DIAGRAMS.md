# 🛫 SkyFlow Presentation Slide Deck (With Flowcharts & Sequence Diagrams)

---

## 📽️ SLIDE 1: Title Slide

### **SkyFlow — Next-Gen Flight Booking & AI Operations Platform**
*Enterprise Air Travel Reservation Platform with Integrated Local AI & Model Context Protocol (MCP)*

- **Presenter**: Vaishnavi & Team
- **Stack**: Angular 18 | Spring Boot 3 | PostgreSQL | Ollama (`llama3.2:1b`) | MCP
- **Key Highlights**:
  - ⚡ Sub-15ms MCP Database Tool Dispatch
  - 🛡️ Strict Non-Flight Transport Guardrails (Train / Ship / Bus Refusal)
  - ⚙️ Full-Featured Admin Control Center & Fleet Manager
  - 🔒 Stateless Role-Based JWT Security

---

## 📽️ SLIDE 2: Problem Statement

### **Current Flaws in Legacy Airline Booking Systems**

```mermaid
flowchart LR
    A["Legacy Booking Portals"] --> B["❌ High AI Latency & Hallucinations<br/>(Cannot query live DB, answers off-topic trivia)"]
    A --> C["❌ Manual Passenger Entry Errors<br/>(Wrong age, category mismatch, no DOB validation)"]
    A --> D["❌ Administrative Blindspots<br/>(No live fleet maintenance tracking or status controls)"]
    A --> E["❌ Dark Theme Contrast Failures<br/>(White-on-white text, unreadable itineraries)"]
```

- **Fragmented User Experience**: Inaccurate manual age entry and poor mobile/dark-mode contrast.
- **Disconnected Customer Support**: Traditional chatbots cannot verify real flight seats or refund policies.
- **Administrative Complexity**: Operators lack unified real-time control over dynamic flight scheduling and fleet readiness.
- **Security & Role Gaps**: Lack of granular separation between customer bookings and administrative operations.

---

## 📽️ SLIDE 3: System Architecture & Data Flow

### **Micro-Modular Enterprise Architecture**

```mermaid
flowchart TD
    subgraph Frontend["Frontend Layer (Port 4200)"]
        UI["Angular 18 SPA"]
        Components["Standalone Components<br/>(Search, Booking, MyTrips, Admin Ops)"]
        Auth["JWT Token Interceptor"]
        UI --- Components
        Components --- Auth
    end

    subgraph Backend["Backend Layer (Port 8080)"]
        Security["Spring Security 6 + JwtAuthFilter"]
        Controllers["REST Controllers<br/>(Flight, Booking, Admin, Chat, MCP)"]
        Services["Service Business Logic"]
        Security --> Controllers --> Services
    end

    subgraph Database["Data Layer (Port 5432)"]
        PG[("PostgreSQL Database")]
        Flyway["Flyway Migration Engine"]
        PG --- Flyway
    end

    subgraph AI_Engine["Local AI & Protocol Layer"]
        Ollama["Local Ollama Engine<br/>(llama3.2:1b - Port 11434)"]
        MCP["MCP Server Tools<br/>(Fast-Path Database Dispatch)"]
        Clients["External Clients<br/>(Claude Desktop / ChatGPT Actions)"]
        MCP --- Clients
    end

    Auth -->|HTTP REST + Bearer JWT| Security
    Services -->|Spring Data JPA| PG
    Services -->|Tool Execution & Guardrails| MCP
    Services -->|HTTP /api/generate| Ollama
```

---

## 📽️ SLIDE 4: System Requirements & Specifications

### **Prerequisites & Runtime Specs**

```mermaid
flowchart TD
    Req["System Requirements"] --> Java["☕ Java JDK 17+ & Maven 3.8+<br/>Spring Boot 3.2.5"]
    Req --> Node["🟢 Node.js 18+ & npm<br/>Angular CLI 18"]
    Req --> DB["🐘 PostgreSQL 14+ (Port 5432)<br/>Flyway Migration Seed"]
    Req --> AI["🦙 Ollama AI Runtime<br/>llama3.2:1b (8 CPU threads)"]
    Req --> Test["🧪 Automated Unit Tests<br/>21 Passing JUnit 5 / Mockito Tests"]
```

- **Default System Accounts**:
  - 🛡️ **Admin**: `admin@skyflow.com` / `Admin@123` (Redirects to `/admin`)
  - 👤 **Passenger**: `priya@example.com` / `Admin@123` (Redirects to Search `/`)

---

## 📽️ SLIDE 5: Core Features & End-to-End Workflows

### **1. Passenger Booking & PNR Generation Sequence**

```mermaid
sequenceDiagram
    autonumber
    actor User as Passenger
    participant App as Angular Frontend
    participant API as Spring Boot API
    participant DB as PostgreSQL Database

    User->>App: 1. Select Origin & Destination (DEL to BOM)
    App->>API: GET /api/flights/search
    API->>DB: Query indexed flights & available seats
    DB-->>API: Return matching flights
    API-->>App: Display live flights & airline fares

    User->>App: 2. Input DOB (e.g. 15-08-2005)
    Note over App: Client auto-calculates Age (21 yrs) & Category (Adult)

    User->>App: 3. Click 'Confirm Booking'
    App->>API: POST /api/bookings (FlightId, Passengers, Cabin)
    Note over API: Open @Transactional DB Session
    API->>DB: Check seat inventory & lock seats
    API->>DB: Insert Booking & Passenger records
    API->>DB: Decrement availableSeats on Flight
    DB-->>API: Persist & commit transaction
    API-->>App: Return BookingResponse (PNR: SK-729104)
    App-->>User: Display Itinerary Modal & PDF Print Option
```

---

### **2. AI Assistant & Model Context Protocol (MCP) Workflow**

```mermaid
flowchart TD
    UserQuery["User Asks AI: 'Show flights from Delhi to Mumbai'"] --> GuardrailCheck{"Check Non-Flight Transport?<br/>(Train / Ship / Bus keywords)"}
    
    GuardrailCheck -- "Yes (Train/Ship)" --> Refusal["🚫 Instant Guardrail Refusal:<br/>'I only assist with flights and air travel.'"]
    
    GuardrailCheck -- "No (Flight Query)" --> FastPath{"Check MCP Fast-Path?<br/>(Direct database tool match)"}
    
    FastPath -- "Matched Tool" --> MCP_Exec["⚡ Execute MCP Database Tool<br/>(search_flights, get_baggage, cancellation)<br/>⏱️ Latency: < 15ms"]
    MCP_Exec --> FormatResponse["Structured Markdown Table with Live Data"]
    
    FastPath -- "Complex Conversational" --> Ollama_Exec["🦙 Dispatch to Local Ollama (llama3.2:1b)<br/>⏱️ Latency: ~1-2s (8 threads)"]
    Ollama_Exec --> FormatResponse

    FormatResponse --> DisplayChat["Deliver Verified Answer in Chat / Claude Desktop"]
```

---

### **3. Admin Operations & Flight Lifecycle**

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Airline Administrator
    participant Console as Admin Console (/admin)
    participant AdminAPI as Admin Controller
    participant DB as PostgreSQL Database

    Admin->>Console: 1. Click '+ New Route / Flight'
    Console->>AdminAPI: POST /api/admin/flights (FlightNo, Route, Fare, Seats)
    AdminAPI->>DB: Save new Flight entity
    DB-->>Console: 201 Created (Flight immediately live in search)

    Admin->>Console: 2. Click 'Change Status' on Flight 6E-2055
    Console->>AdminAPI: PATCH /api/admin/flights/{id}/status?status=DELAYED
    AdminAPI->>DB: Update status to DELAYED
    DB-->>Console: Flight badge updated to DELAYED

    Admin->>Console: 3. Toggle Aircraft Status (VT-IFG)
    Console->>Console: Toggle 'Operational' ➔ 'In Maintenance'
    Note over Console: Recalculate Fleet Readiness % in real-time

    Admin->>Console: 4. Click 'Export Fleet CSV'
    Console-->>Admin: Download 'SkyFlow_Fleet_Report.csv'
```

---

## 📽️ SLIDE 6: Engineering Challenges Faced & Solutions

```mermaid
flowchart TD
    subgraph Challenges["Past Engineering Obstacles"]
        C1["1. Button Desync despite 200 OK API"]
        C2["2. JWT Invalidation & 400/403 Routing Blocks"]
        C3["3. Slow AI (>15s) & Format Drift"]
        C4["4. Dark Mode White-on-White Text"]
        C5["5. Database Consistency & Dropped Bookings"]
    end

    subgraph Solutions["Engineered Solutions"]
        S1["Reactive RxJS event bindings + ChangeDetectorRef"]
        S2["Stateless JwtAuthFilter + Role Interceptors (/admin vs /)"]
        S3["Dual-Engine Pipeline: <15ms MCP Fast-Path + Ollama Tuning"]
        S4["Standardized CSS Custom Properties (--card-bg, --text-main)"]
        S5["@Transactional JPA sessions + Atomic Seat Decrements"]
    end

    C1 ==> S1
    C2 ==> S2
    C3 ==> S3
    C4 ==> S4
    C5 ==> S5
```

---

## 📽️ SLIDE 7: Uniqueness & Key Differentiators

```mermaid
mindmap
  root((SkyFlow Advantages))
    Local AI & MCP
      100% Free - Zero API Costs
      Runs Locally via Ollama
      Claude Desktop & ChatGPT Action Ready
    Sub-15ms Latency
      Deterministic Database Fast-Path
      Instant Baggage & Policy Lookups
    Strict Domain Guardrails
      Rejects Train / Ship / Bus Journeys
      Zero Hallucinations on Airline Policies
    End-to-End Admin Governance
      Interactive Route Creator
      Aircraft Maintenance Toggle
      Live Flight Status Cycler
    Smart Error Prevention
      Automated DOB-to-Age Computation
      Eliminates Passenger Category Errors
```

---

## 📽️ SLIDE 8: Conclusion & Future Scope

```mermaid
timeline
    title SkyFlow Evolution Roadmap
    Phase 1 (Completed) : Full-Stack Web Platform : JWT Role Auth : Automated DOB Age Calc : Local Ollama AI & MCP : Admin Operations Suite
    Phase 2 (Near Future) : Interactive 3D Seat Map : Multi-City & Round Trips : Live Flight Radar Tracking API
    Phase 3 (Enterprise Scale) : Dynamic Pricing Engine : WhatsApp Boarding Passes : Multi-Airline GDS Integration
```

- **Project Summary**: SkyFlow successfully delivers an enterprise-grade, high-performance, and intelligent flight booking ecosystem combining robust web engineering with local AI and MCP tool integration.
- **Q&A**: Open floor for questions and live system demonstration.
