# 📊 Gemini AI Presentation (PPT) Generation Prompt (With Flowcharts & Sequence Diagrams)

> **Instructions for Use**: Copy and paste the prompt below directly into **Google Gemini AI** (or into your existing Gemini conversation) to generate your updated presentation with embedded Mermaid flowcharts and sequence diagrams!

---

```text
You are an expert technical presentation designer and software architect. Please update and regenerate the 8-slide presentation for "SkyFlow: Next-Gen Flight Booking & AI Operations System", adding clear, visual ASCII/Mermaid flowcharts and sequence diagrams into the slides.

Format the output clearly slide-by-slide with:
- Slide Title
- Visual Diagram (Flowchart / Sequence Diagram / Architecture Map in Mermaid/ASCII)
- Key Bullet Points (concise, high impact)
- Speaker Notes (for the presenter)

Please structure the slides in the following exact order:

---

### SLIDE 1: Title Slide
- Title: SkyFlow — Next-Gen Flight Booking & Intelligent Operations System
- Subtitle: Enterprise Air Travel Reservation Platform with Integrated Local AI & Model Context Protocol (MCP)
- Presenter: [Your Name / Team Name]
- Key Highlights: Full-Stack Architecture | Local Ollama AI | Enterprise Admin Center | Role-Based JWT Security

---

### SLIDE 2: Problem Statement (With Pain-Point Flowchart)
- Visual Diagram:
  [Legacy Portals] --> [High AI Latency & Hallucinations]
  [Legacy Portals] --> [Manual Passenger Entry & Age Errors]
  [Legacy Portals] --> [Administrative Blindspots & No Fleet Tracking]
  [Legacy Portals] --> [Dark Theme Contrast & White-on-White Text]
- Key Points:
  - Fragmented User Experience: Confusing multi-step forms and inaccurate manual age calculations.
  - Disconnected Customer Support: Chatbots lack live database access and hallucinate invalid policies.
  - Administrative Complexity: Airline operators lack real-time control over dynamic scheduling and fleet maintenance.
  - Security & Role Gaps: Weak isolation between public customer reservations and privileged administrative controls.

---

### SLIDE 3: System Architecture & Data Flow (With Architecture Diagram)
- Visual Diagram:
  [Angular 18 Frontend - Port 4200] --(HTTP REST + JWT)--> [Spring Boot 3 Backend - Port 8080]
  [Spring Boot 3 Backend] --(Spring Data JPA)--> [PostgreSQL Database - Port 5432]
  [Spring Boot 3 Backend] --(Tool Execution)--> [Model Context Protocol (MCP) Server]
  [Spring Boot 3 Backend] --(HTTP /api/generate)--> [Local Ollama Engine - llama3.2:1b]
  [MCP Server] <--(stdio JSON-RPC / OpenAPI)--> [Claude Desktop & ChatGPT Actions]
- Key Points:
  - Frontend Layer: Angular 18 Single Page Application with Standalone Components & RxJS.
  - Backend Layer: Enterprise REST API with Spring Boot 3.2.5 and Spring Security 6.
  - Database Layer: PostgreSQL 14+ with Flyway automated migrations.
  - AI & Protocol Layer: Local Ollama runtime (llama3.2:1b) + Model Context Protocol (MCP).

---

### SLIDE 4: Requirements & System Specifications (With Tech Specs Flowchart)
- Visual Diagram:
  [SkyFlow Prerequisites] --> [Java 17+ & Spring Boot 3.2.5]
  [SkyFlow Prerequisites] --> [Node.js 18+ & Angular CLI 18]
  [SkyFlow Prerequisites] --> [PostgreSQL 14+ Database]
  [SkyFlow Prerequisites] --> [Ollama AI (llama3.2:1b)]
  [SkyFlow Prerequisites] --> [21 Unit Tests (100% Passing)]
- Key Points:
  - Runtime environment: Java 17+, Node.js 18+, PostgreSQL 14+, Ollama AI.
  - Security specifications: Stateless HMAC-SHA256 JWT tokens with BCrypt password encryption.
  - Role Accounts: Admin (`admin@skyflow.com` ➔ `/admin`) and Passenger (`priya@example.com` ➔ `/`).

---

### SLIDE 5: Core Features & End-to-End Workflows (With Sequence Diagrams)
- Visual Sequence Diagram 1 (Passenger Booking Lifecycle):
  Passenger -> Angular UI: Select Route (DEL to BOM) & Search
  Angular UI -> Spring Boot API: GET /api/flights/search
  Spring Boot API -> PostgreSQL: Query indexed flights
  Passenger -> Angular UI: Enter DOB (Client auto-calculates Age & Category: Adult)
  Passenger -> Angular UI: Click 'Confirm Booking'
  Angular UI -> Spring Boot API: POST /api/bookings (@Transactional)
  Spring Boot API -> PostgreSQL: Insert Booking & Decrement availableSeats
  Spring Boot API -> Angular UI: Return PNR Code & Itinerary Modal (Print PDF)

- Visual Flowchart 2 (Dual-Engine AI & MCP Dispatch):
  [User Query] --> {Check Non-Flight Transport?}
  {Check Non-Flight Transport?} -- Yes (Train/Ship) --> [🚫 Guardrail Refusal: 'Flight assistance only']
  {Check Non-Flight Transport?} -- No --> {Check MCP Fast-Path?}
  {Check MCP Fast-Path?} -- Matched Tool --> [⚡ Execute MCP DB Tool (<15ms)]
  {Check MCP Fast-Path?} -- Conversational --> [🦙 Local Ollama Inference (~1s)]
  Both --> [Deliver Verified Table in Chat]

- Key Points:
  - Smart Booking: Automated DOB-to-Age calculation, PNR generation, and PDF printing.
  - Local AI & MCP: Sub-15ms fast-path responses with air-travel domain guardrails.
  - Admin Operations: + New Route modal, live flight status cycling, fleet maintenance manager.

---

### SLIDE 6: Engineering Challenges Faced & Solutions (With Problem-Solution Mapping)
- Visual Mapping Diagram:
  [1. Button Desync despite 200 OK API] ====> [Reactive RxJS bindings + ChangeDetectorRef]
  [2. JWT Invalidation & 400/403 Errors] ====> [Stateless JwtAuthFilter + Role-aware Interceptor]
  [3. Slow AI (>15s) & Format Drift] ====> [Dual-Engine: <15ms MCP Fast-Path + Ollama Tuning]
  [4. Dark Mode White-on-White Text] ====> [Standardized CSS Custom Properties (--card-bg)]
  [5. Dropped Bookings under Concurrency] ====> [@Transactional JPA Sessions + Atomic Seat Decrements]
- Key Points:
  - Frontend-Backend Sync: Solved asynchronous UI update bugs with explicit Change Detection.
  - Authentication: Eliminated session drops and 400 series errors with clean JWT filter chains.
  - AI Optimization: Reduced latency by 90% using MCP tool fast-paths and multi-threaded Ollama.
  - UI Accessibility: Fixed contrast issues with standardized dark theme CSS tokens.

---

### SLIDE 7: Uniqueness & Key Differentiators (With Mindmap)
- Visual Mindmap:
  [SkyFlow Uniqueness]
    ├── [100% Free & Private Local AI (Ollama + MCP)]
    ├── [Sub-15ms Database Fast-Path Dispatch]
    ├── [Air-Travel Domain Guardrails (Rejects Train/Ship/Bus)]
    ├── [Complete Admin Fleet & Route Governance]
    └── [Automated Error Prevention (DOB-to-Age Calculation)]
- Key Points:
  - Zero API Costs: Completely self-hosted AI runtime without recurring subscription fees.
  - Instant Retrieval: Sub-15ms queries for baggage allowances, airport codes, and flight schedules.
  - Native Protocol Support: Works out-of-the-box with Claude Desktop and ChatGPT Actions.

---

### SLIDE 8: Conclusion & Future Scope (With Timeline Roadmap)
- Visual Timeline:
  [Phase 1 (Completed)] : Full-Stack Web Platform, JWT Security, Local AI & MCP, Admin Console
  [Phase 2 (Near Future)] : Interactive 3D Seat Map, Multi-City Booking, Live Flight Radar API
  [Phase 3 (Enterprise)] : Dynamic Pricing Engine, WhatsApp Boarding Passes, GDS Integration
- Key Points:
  - Project Summary: Successfully built an enterprise-grade, intelligent flight booking ecosystem.
  - Scalable Roadmap: Ready for 3D seat mapping, multi-city itineraries, and radar tracking.
  - Open Floor for Q&A and Live System Demonstration.
```
