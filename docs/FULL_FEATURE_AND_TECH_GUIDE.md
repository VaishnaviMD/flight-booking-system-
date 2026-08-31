# ✈️ SkyFlow Flight Booking System — Full Feature & Technology Guide

> **Welcome!** This document gives a comprehensive, easy-to-understand explanation of every single feature in **SkyFlow**, from User Authentication to the Admin Control Center, along with the exact technologies used in each module.

---

## 📑 Table of Contents
1. [Overall Technology Stack](#1-overall-technology-stack)
2. [Feature 1: User & Admin Registration and Login](#2-feature-1-user--admin-registration-and-login)
3. [Feature 2: Flight Search & Multi-Filter Engine](#3-feature-2-flight-search--multi-filter-engine)
4. [Feature 3: Passenger Details & Smart Age Calculation](#4-feature-3-passenger-details--smart-age-calculation)
5. [Feature 4: Booking Checkout & PNR Ticket Generation](#5-feature-4-booking-checkout--pnr-ticket-generation)
6. [Feature 5: "My Bookings" & Interactive Itinerary Modal](#6-feature-5-my-bookings--interactive-itinerary-modal)
7. [Feature 6: Local Ollama AI Assistant (`llama3.2:1b`)](#7-feature-6-local-ollama-ai-assistant-llama321b)
8. [Feature 7: Model Context Protocol (MCP) Server](#8-feature-7-model-context-protocol-mcp-server)
9. [Feature 8: Claude Desktop & ChatGPT Integration](#9-feature-8-claude-desktop--chatgpt-integration)
10. [Feature 9: Admin Operations Control Center (`/admin`)](#10-feature-9-admin-operations-control-center-admin)
11. [Feature 10: Dark / Light Mode Theme Engine](#11-feature-10-dark--light-mode-theme-engine)
12. [Feature 11: Automated Unit Testing Suite (21 Tests)](#12-feature-11-automated-unit-testing-suite-21-tests)

---

## 1. Overall Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **Angular 18 (Standalone Components)**, TypeScript, HTML5, SCSS, RxJS | Modern Single Page Application (SPA) with fast, reactive UI |
| **Icons & Design** | Google Material Icons, Custom CSS Theme Variables | Responsive Dark/Light themes and clean typography |
| **Backend REST API** | **Java 17 / 21**, **Spring Boot 3.2.5** | High-performance enterprise REST API and business logic |
| **Security & Auth** | **Spring Security 6**, **JSON Web Tokens (JWT - `jjwt`)**, **BCrypt** | Secure password hashing and stateless token authentication |
| **Database & ORM** | **PostgreSQL**, **Spring Data JPA**, **Hibernate**, **HikariCP** | Relational data persistence, indexed queries, connection pooling |
| **Database Migrations**| **Flyway 9.22.3** | Automated schema versioning and seeding initial flights |
| **Local AI Engine** | **Ollama (`llama3.2:1b`)** | 100% private, local Large Language Model generation |
| **AI Protocol** | **Model Context Protocol (MCP)**, JSON-RPC 2.0 | Live database tool calling for Claude Desktop and ChatGPT |
| **Unit Testing** | **JUnit 5**, **Mockito** | 21 automated tests verifying auth, bookings, and AI tools |
| **Build Tools** | **Maven** (Backend), **Angular CLI / npm** (Frontend), **Git** | Package management, compilation, and version control |

---

## 2. Feature 1: User & Admin Registration and Login

### 🌟 What it does for the user:
- Customers can create a personal account using their First Name, Last Name, Email, Password, and Phone Number.
- When an account is created, a green alert banner confirms registration and automatically redirects to the login screen with their email pre-filled.
- Users and Admins can log into the system with verified credentials.
- **Smart Role Redirection**: 
  - 👤 **Regular Users (`ROLE_USER`)** are redirected to the flight search home page (`/`).
  - 🛡️ **Admins (`ROLE_ADMIN`)** are automatically redirected to the **Admin Operations Console** (`/admin`).

### ⚙️ How it works under the hood:
1. When submitting the registration form, Angular sends a `POST /api/auth/register` request.
2. Spring Boot verifies if the email is already registered. If unique, it hashes the password with **BCrypt** and saves the user in the PostgreSQL `users` table.
3. On login (`POST /api/auth/login`), Spring Boot verifies credentials and generates a signed **JWT (JSON Web Token)** containing the user's ID, Email, and Role (`ROLE_USER` or `ROLE_ADMIN`).
4. The Angular frontend stores the JWT token in `localStorage` and attaches it via HTTP interceptor to all subsequent authorized requests.

### 🛠️ Technologies Used:
- **Angular 18**: `LoginComponent`, `RegisterComponent`, `AuthService`, `ToastService`
- **Spring Boot 3**: `AuthController.java`, `AuthServiceImpl.java`, `JwtUtil.java`, `JwtAuthFilter.java`
- **Security**: BCrypt Password Encoder, HMAC-SHA256 JWT

---

## 3. Feature 2: Flight Search & Multi-Filter Engine

### 🌟 What it does for the user:
- Allows travelers to search flights between major Indian airports (Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Kochi, Goa, Pune, Ahmedabad).
- Provides instant multi-attribute filtering:
  - **Price Range Slider** (e.g. ₹2,000 to ₹25,000).
  - **Airline Checkboxes** (IndiGo, Air India, SpiceJet, Vistara, Akasa Air).
  - **Stops Filter** (Non-stop / Direct vs 1-Stop).
  - **Cabin Class Dropdown** (Economy vs Business).
- Dynamic sorting by Lowest Price, Highest Price, Departure Time, and Flight Duration.

### ⚙️ How it works under the hood:
1. The user inputs their trip criteria on the search banner.
2. Angular triggers `GET /api/flights/search` with parameters (`originCode`, `destinationCode`, `departureDate`, `passengers`, `cabinClass`, `minPrice`, `maxPrice`).
3. Spring Data JPA queries PostgreSQL using indexed search criteria and dynamic SQL filters.
4. Flights are sorted in memory using Java 8 Streams and returned to the UI.

### 🛠️ Technologies Used:
- **Angular 18**: `FlightSearchComponent`, `FlightFilterPanelComponent`, `FlightListComponent`
- **Backend**: `FlightController.java`, `FlightServiceImpl.java`, `FlightRepository.java`
- **Database**: PostgreSQL indexed `flights`, `airports`, and `airlines` tables

---

## 4. Feature 3: Passenger Details & Smart Age Calculation

### 🌟 What it does for the user:
- Booking form where travelers enter passenger information (Title, First Name, Last Name, Date of Birth, Gender, Passport/ID).
- **Automated DOB-to-Age Calculation**: The moment a user picks their Date of Birth, the system instantly computes their exact age in years.
- **Auto-Categorization**: Automatically assigns the passenger type:
  - 👶 **Infant** (< 2 years)
  - 🧒 **Child** (2 to 11 years)
  - 🧑 **Adult** (12+ years)
- International **Nationality dropdown** (defaulting to Indian).
- Seat Preferences (Window, Aisle, Middle) and Meal Preferences (Veg, Non-Veg, Jain).

### ⚙️ How it works under the hood:
1. In `booking.component.ts`, the `onDobChange()` event calculates the difference between current date and the selected DOB.
2. The Age input is marked `readonly` with a visual `(Auto-calculated)` badge to prevent manual data entry errors.
3. Passenger arrays are validated before moving to checkout.

### 🛠️ Technologies Used:
- **Angular 18**: `BookingComponent`, Reactive Forms, Two-way Data Binding (`[(ngModel)]`)
- **Backend**: `BookingRequest.java`, `PassengerRequest.java`

---

## 5. Feature 4: Booking Checkout & PNR Ticket Generation

### 🌟 What it does for the user:
- Displays a clean booking summary with ticket fare, taxes (12% GST), passenger breakdown, and final total in ₹ (INR).
- Clicking **"Confirm Booking"** creates the official reservation and generates a unique 6-character **PNR Code** (e.g. `SK-729104`).
- Instantly reduces the flight's available seat count in PostgreSQL.

### ⚙️ How it works under the hood:
1. Angular sends `POST /api/bookings` with the `flightId`, `cabinClass`, and list of `passengers`.
2. Spring Boot opens a database transaction (`@Transactional`):
   - Verifies seat availability.
   - Generates a unique PNR reference code.
   - Calculates base price + tax total.
   - Saves `Booking` and associated `Passenger` entities.
   - Decrements `availableSeats` on the `Flight` entity.
3. Returns `BookingResponse` with confirmation details.

### 🛠️ Technologies Used:
- **Angular 18**: `BookingComponent`, `BookingService`
- **Backend**: `BookingController.java`, `BookingServiceImpl.java`, `BookingRepository.java`
- **Database**: PostgreSQL Foreign Key Relational Schema (`bookings` ➔ `passengers` ➔ `flights`)

---

## 6. Feature 5: "My Bookings" & Interactive Itinerary Modal

### 🌟 What it does for the user:
- **Active & Past Trips Dashboard**: Shows all confirmed, pending, and past flights booked by the logged-in user.
- **View Itinerary Modal**: Clicking "View Itinerary" opens a detailed popup containing:
  - Complete Route Summary (Origin & Destination cities, IATA codes, Terminal info).
  - Airline name, Flight number, Departure & Arrival timestamps, Cabin class.
  - Passenger breakdown with auto-generated unique **Ticket Numbers** (e.g. `SK-9081245671`).
- **Print Ticket / Save PDF**: Built-in printer utility allowing users to print or save their e-ticket as a PDF.
- **One-Click Cancellation**:
  - Automatically checks departure time.
  - Full 100% refund if cancelled > 24 hours prior to departure.
  - 20% cancellation fee if within 24 hours.

### ⚙️ How it works under the hood:
1. `MyBookingsComponent` fetches `GET /api/bookings/my` using the logged-in user's JWT ID.
2. Injected `ChangeDetectorRef` forces instant template rendering upon API response.
3. Cancellation sends `PATCH /api/bookings/{id}/cancel`, updating booking status to `CANCELLED` and releasing seats back to the flight.

### 🛠️ Technologies Used:
- **Angular 18**: `MyBookingsComponent`, `MyTripsComponent`, Modal Dialog SCSS
- **Backend**: `BookingController.java`, `BookingServiceImpl.java`

---

## 7. Feature 6: Local Ollama AI Assistant (`llama3.2:1b`)

### 🌟 What it does for the user:
- Dedicated AI travel assistant accessible at `/assistant`.
- Users can ask natural language flight questions:
  - *"Are there flights from Delhi to Mumbai under ₹5,000?"*
  - *"What is the cabin baggage limit on Vistara?"*
  - *"How does the 24-hour cancellation refund work?"*
- **Strict Non-Flight Domain Guardrails**:
  - If a user asks about **Train journeys (IRCTC, railways)**, **Ships / Cruises (ferries, ocean boats)**, or **Buses / Cabs**, the AI politely refuses and redirects them to air travel.
  - For unrelated general trivia (coding, recipes, math), it politely states its purpose as a flight guide.
- **Ultra-Fast Responses (<15ms Fast-Path & ~1s LLM)**: Common questions resolve in milliseconds.

### ⚙️ How it works under the hood:
1. Angular sends user chat queries to `POST /api/chat`.
2. `ChatbotServiceImpl.java` runs:
   - **Step 1**: Guardrail validation against non-flight transport keywords.
   - **Step 2**: Fast-path pattern match against MCP database tools.
   - **Step 3**: If complex, sends a prompt-engineered payload to the local **Ollama** runtime (`http://localhost:11434/api/generate`) with `llama3.2:1b`.
3. Returns markdown response formatted with bold tags and lists.

### 🛠️ Technologies Used:
- **AI Runtime**: **Ollama**, `llama3.2:1b` (Lightweight 1 Billion parameter model)
- **Backend**: `ChatbotController.java`, `ChatbotServiceImpl.java`, Spring WebClient

---

## 8. Feature 7: Model Context Protocol (MCP) Server

### 🌟 What it does:
- Exposes SkyFlow's live database directly to AI models using Anthropic's **Model Context Protocol (MCP)** standard.
- Registers **5 live database tools**:
  1. `search_flights`: Look up scheduled flights, fares, airlines, and available seats.
  2. `get_baggage_allowance`: Official Economy (15 Kg) & Business (25 Kg) luggage rules.
  3. `get_cancellation_policy`: 24-hr refund rules, cancellation fees, and refund processing time.
  4. `get_airports_list`: All operational metro airports and IATA codes.
  5. `get_passenger_age_rules`: Automated DOB-to-Age rules and passenger categories.

### ⚙️ How it works under the hood:
1. Located in `backend/src/main/java/com/flightbooking/mcp/`.
2. Exposes standard REST endpoints (`/api/mcp/tools`, `/api/mcp/call`) and standard JSON-RPC 2.0 endpoint (`/api/mcp/rpc`).
3. Executes real-time JPA database queries against PostgreSQL and returns structured tool results.

### 🛠️ Technologies Used:
- **Backend**: `McpTool.java`, `McpFlightToolService.java`, `McpController.java`
- **Protocol**: Model Context Protocol (MCP) JSON-RPC 2.0 specification

---

## 9. Feature 8: Claude Desktop & ChatGPT Integration

### 🌟 What it does:
- **Claude Desktop (100% Free)**:
  - Users can open the official Claude Desktop app on their computer.
  - Claude natively connects to SkyFlow via `mcp/claude-mcp-server.js` (stdio bridge).
  - Claude can call SkyFlow tools to answer live flight queries during chat!
  - Includes a **1-click installer** (`install-claude-mcp.bat`).
- **ChatGPT Custom Actions**:
  - Exposes dedicated endpoints under `/api/chatgpt/**`.
  - Includes **OpenAPI 3.1.0 specification** (`mcp/chatgpt-action-openapi.json`) and OpenAI plugin manifest (`.well-known/ai-plugin.json`).
  - Includes a **1-click cloud tunnel** using Cloudflare (`start-chatgpt-tunnel.bat`).

### 🛠️ Technologies Used:
- **Node.js**: `mcp/claude-mcp-server.js` (stdio JSON-RPC bridge)
- **API Spec**: OpenAPI 3.1.0, OpenAI Plugin Manifest standard
- **Tunneling**: Cloudflare Tunnel (`cloudflared.exe`)

---

## 10. Feature 9: Admin Operations Control Center (`/admin`)

### 🌟 What it does for administrators:
A full-fledged operations dashboard for airline administrators:
1. **Live Dashboard Analytics**:
   - Total System Bookings, Confirmed Bookings count.
   - Live Ticket Revenue Gross (₹).
   - Scheduled Flights count & Fleet Readiness percentage (%).
2. **`+ New Flight / Route` Modal**:
   - Interactive dialog to publish new flight routes with custom flight number, airline, origin, destination, base fare, seats, and cabin class.
3. **Flight Status Management & Deletion**:
   - Cycle flight statuses (`SCHEDULED` ➔ `DELAYED` ➔ `CANCELLED` ➔ `COMPLETED`).
   - Remove/retire flights from the schedule.
4. **Fleet Management**:
   - Aircraft registry with Tail numbers and models.
   - `+ Add Aircraft` modal to register new planes.
   - **Inspect / Maintenance Toggle**: Switches aircraft between *Operational* and *In Maintenance*, auto-updating fleet readiness.
   - `📥 Export Fleet CSV`: Downloads a CSV fleet summary report.
5. **Customer Bookings Directory**:
   - System-wide view of all customer bookings with live PNR search.
6. **Registered Users Directory**:
   - User account inspection and role visibility (`ADMIN` vs `USER`).
7. **System Status Monitor**:
   - Live diagnostic check for Spring Boot, PostgreSQL, Ollama AI, and MCP tools.

### ⚙️ How it works under the hood:
1. Protected by Spring Security `@PreAuthorize("hasRole('ADMIN')")`.
2. Admin frontend (`AdminComponent`) interacts with `AdminService` and `FleetService`.
3. Backend handles CRUD operations via `AdminController.java`.

### 🛠️ Technologies Used:
- **Angular 18**: `AdminComponent`, `AdminService`, `FleetService`
- **Backend**: `AdminController.java`, `FlightServiceImpl.java`

---

## 11. Feature 10: Dark / Light Mode Theme Engine

### 🌟 What it does:
- Modern dark theme featuring dark navy surfaces (`#111a30`, `#0b1120`) and vibrant emerald green accents (`#00dc82`).
- Seamless toggle to clean light mode.
- High-contrast, WCAG-compliant white typography on dark backgrounds.

### 🛠️ Technologies Used:
- CSS Custom Properties (Theme Tokens in `styles.scss`).

---

## 12. Feature 11: Automated Unit Testing Suite (21 Tests)

### 🌟 What it does:
Comprehensive test coverage ensuring zero regressions across all core subsystems.

| Test Class | Tests Run | What is Verified |
| :--- | :---: | :--- |
| `JwtUtilTest` | **3** | Token generation, cryptographic signature validation, token expiration |
| `AuthServiceImplTest` | **5** | User registration, duplicate email rejection, login verification, bad password handling |
| `McpFlightToolServiceTest` | **5** | MCP tool discovery, baggage policy, cancellation rules, flight lookups, transport guardrails |
| `ChatbotServiceImplTest` | **5** | AI guardrails for train/ship, non-travel refusal, MCP tool dispatch |
| `FlightServiceImplTest` | **2** | Search criteria filtering, flight ID lookups |
| `BookingServiceImplTest` | **1** | Passenger count derivation, seat decrement calculation |
| **Total Passing Tests** | **21 / 21** | **BUILD SUCCESS (0 Failures, 0 Errors)** |

---

*Documentation prepared for SkyFlow Flight Booking System.*
