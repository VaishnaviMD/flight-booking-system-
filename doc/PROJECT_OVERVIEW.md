# ✈️ SkyFlow Flight Booking System — Comprehensive Project Overview & Features

---

## 📌 Executive Summary

**SkyFlow** is a full-stack, enterprise-grade Flight Search, Reservation, and Fleet Management Web Application with an integrated AI Ecosystem. Built using **Angular 18** on the frontend, **Spring Boot 3 (Java 17)** on the backend, **PostgreSQL 14** as the relational database, **Ollama (`llama3.2:1b`)** for local AI chat, **Model Context Protocol (MCP)** for Claude Desktop integration, and **OpenAPI 3.1.0 ChatGPT Actions**.

SkyFlow offers end-to-end flight booking workflows, automated age and passenger categorization, real-time fare and baggage computations, an interactive itinerary generator with printable e-tickets, and an Admin Operations Control Center.

---

## 🎯 Target Audience & User Personas

| Persona | Role | Key Capabilities & Features |
| :--- | :--- | :--- |
| **Traveler / Customer** | `ROLE_USER` | Search flights, apply filters, book tickets, select seats/meals, view active/past trips, download printable e-tickets, cancel bookings, ask AI assistant for flight schedules and baggage rules. |
| **Airline Operations Admin** | `ROLE_ADMIN` | Schedule new flights, update flight status (`SCHEDULED`, `DELAYED`, `CANCELLED`, `COMPLETED`), manage aircraft fleet readiness, search customer bookings by PNR, manage registered users, monitor system health. |
| **AI Assistant / Claude / ChatGPT** | `MCP / API` | Execute automated tool calls against live PostgreSQL database to answer schedule queries, baggage allowances, cancellation terms, airport lists, and age calculation rules. |

---

## 🌟 Detailed Feature Breakdown

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **JWT Security Architecture**: Uses signed JSON Web Tokens (`HMAC-SHA256`) for state-less authorization (`JwtUtil.java`, `JwtAuthFilter.java`).
- **BCrypt Encryption**: Passwords encrypted securely prior to persistence in PostgreSQL.
- **Smart Post-Login Redirection**:
  - `ROLE_ADMIN` users are automatically navigated to `/admin`.
  - `ROLE_USER` users are navigated to `/` (Flight Search Dashboard).
- **Protected Routes**: Angular Auth Guards (`auth.guard.ts`, `admin.guard.ts`) protect administrative and booking pages.

---

### 2. 🔍 Flight Search & Multi-Filter Engine
- **Indian Airport Metro Hubs**: Supports origin/destination lookups between 10 major hubs:
  - `DEL` (Delhi - Indira Gandhi Intl)
  - `BOM` (Mumbai - Chhatrapati Shivaji Maharaj Intl)
  - `BLR` (Bengaluru - Kempegowda Intl)
  - `MAA` (Chennai Intl)
  - `HYD` (Hyderabad - Rajiv Gandhi Intl)
  - `CCU` (Kolkata - Netaji Subhash Chandra Bose Intl)
  - `COK` (Cochin Intl)
  - `PNQ` (Pune Airport)
  - `AMD` (Sardar Vallabhbhai Patel Intl)
  - `GOI` (Goa Dabolim Intl)
- **Dynamic Filters**:
  - Maximum price slider.
  - Airline multi-selector (IndiGo, Air India, SpiceJet, Vistara, Akasa Air).
  - Stop filter (Direct vs 1-Stop).
- **Sorting Options**: Lowest Price, Highest Price, Earliest Departure, and Shortest Duration.

---

### 3. 🎫 Booking & Passenger Management
- **Automated DOB to Age Calculation**: Computes exact age in years from Date of Birth input.
- **Passenger Categorization**:
  - 🍼 **Infant**: `< 2 years` (Special lap-seat rules)
  - 🧒 **Child**: `2–11 years` (Reduced fare class)
  - 🧑 **Adult**: `12+ years` (Standard fare)
- **International Nationality Selector**: Select nationality for international passport matching.
- **Preferences**:
  - **Seat Types**: Window, Aisle, Middle.
  - **Meal Options**: Veg, Non-Veg, Jain.
- **Promo Coupon Engine**: Validate and apply discount coupons (e.g. `WELCOME10`, `SKYFLOW500`, `FLY2026`) with instant total calculation updates.

---

### 4. 📄 Booking Management & Interactive Itinerary
- **"My Bookings" Dashboard**: List active upcoming trips and historical completed/cancelled bookings.
- **Interactive Itinerary Modal**: Visual ticket breakdown including passenger details, seats, meals, ticket numbers, PNR, flight status, and route map.
- **Printable E-Ticket**: Instant generation of clean printable PDF/e-ticket layout.
- **Cancellation & Refunds**: One-click booking cancellation with automated refund eligibility calculation based on cancellation window rules.

---

### 5. 🛡️ Admin Operations Control Center (`/admin`)
- **Interactive Route Creator**: Schedule new flight offerings by selecting partner airline, origin, destination, departure/arrival timestamps, cabin class pricing, and total seat capacity.
- **Flight Status Manager**: Cycle flight statuses live (`SCHEDULED` ➔ `BOARDING` ➔ `DELAYED` ➔ `CANCELLED` ➔ `COMPLETED`).
- **Fleet Manager**: Track aircraft tail numbers, model types (`Airbus A320neo`, `Boeing 787-9`), total hours flown, and toggle maintenance state (`Operational` vs `In Maintenance`).
- **Customer Reservation Directory**: Inspect all bookings system-wide with PNR filtering.
- **System Health Diagnostics**: Real-time diagnostic panel monitoring Spring Boot backend uptime, PostgreSQL DB connection, Ollama AI service status, and MCP tools readiness.

---

### 6. 🤖 AI Ecosystem (Ollama, MCP & ChatGPT Actions)
- **Ollama AI Assistant (`llama3.2:1b`)**: Local LLM backend providing conversational assistant tailored to SkyFlow.
- **Model Context Protocol (MCP)**:
  - Standard JSON-RPC 2.0 stdio server (`mcp/claude-mcp-server.js`).
  - 5 DB Tools: `search_flights`, `get_baggage_allowance`, `get_cancellation_policy`, `get_airports_list`, `get_passenger_age_rules`.
  - Direct integration with **Claude Desktop**.
- **ChatGPT Custom Action / OpenAPI**:
  - Exposes `/api/chatgpt/openapi.json` (OpenAPI 3.1.0 spec) and `/.well-known/ai-plugin.json` for ChatGPT Custom GPT integration.
- **Domain Guardrails**: Enforces air-travel scope; rejects queries about trains, buses, or non-travel topics.

---

## 🛠️ Complete Technology Stack

| Layer | Technology / Framework | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | Angular | 18.x | Component-based single page application |
| **Frontend Styling** | Custom Vanilla CSS (Modern CSS Variables) | CSS3 | Responsive glassmorphism UI & dark mode themes |
| **State & HTTP** | RxJS / Angular HttpClient | 7.x | Reactive async data streams & backend API integration |
| **Backend Framework** | Spring Boot | 3.2.x | REST API server & business logic |
| **Programming Language** | Java | 17 LTS | Core backend codebase |
| **Database ORM** | Spring Data JPA / Hibernate | 6.x | Entity mapping & persistence layer |
| **Database Migrations** | Flyway | 9.x | Version-controlled SQL database migrations |
| **Database Engine** | PostgreSQL | 14.x | Relational database storage |
| **Security Layer** | Spring Security + JJWT | 0.11.x | Role-based authorization & JWT token verification |
| **Local LLM** | Ollama (`llama3.2:1b`) | Latest | Local generative AI chatbot engine |
| **AI Protocol** | Model Context Protocol (MCP) | 2024-11-05 | Claude Desktop stdio JSON-RPC tool bridge |
| **API Specification** | OpenAPI / Swagger UI | 3.1.0 | Interactive API documentation & ChatGPT Action spec |
| **Unit Testing** | JUnit 5 + Mockito | 5.x | Automated unit & integration testing |
