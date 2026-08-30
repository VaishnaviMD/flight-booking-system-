# SkyFlow Flight Booking System

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Default Credentials](#default-credentials)
- [API Endpoints](#api-endpoints)

---

## 🎯 Project Overview

**SkyFlow** is a modern, enterprise-grade flight search, reservation, and passenger management system. It provides real-time flight lookups, interactive e-ticketing, intelligent age and fare computations, a complete Admin Operations Control Center, and an integrated AI assistant ecosystem.

### Core Capabilities
- ✈️ Real-time flight search across major Indian airports
- 🔐 JWT-based authentication with role-based access control
- 📱 Responsive Angular 22 frontend
- 🤖 AI-powered assistant with Ollama, MCP, and ChatGPT integration
- 📊 Complete admin dashboard for flight management

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 22 | SPA framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Angular Material | Latest | UI components |
| RxJS | Latest | Reactive programming |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Programming language |
| Spring Boot | 3.2 | REST API framework |
| Spring Security | 6.x | JWT authentication |
| Spring Data JPA | Latest | ORM/Database access |
| Flyway | Latest | Database migrations |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 15/16 | Primary database |
| H2 | Latest | Dev/testing (in-memory) |

### AI & Integration
| Technology | Purpose |
|------------|---------|
| Ollama | Local LLM inference (llama3.2:1b) |
| MCP Server | AI tool protocol for Claude/VS Code |
| ChatGPT Plugin | Custom GPT Action support |
| Cloudflare Tunnel | Expose local server to internet |

---

## ✨ Key Features

### 1. Authentication & Security
- Secure user registration and login
- JWT token-based authentication (HMAC-SHA256)
- BCrypt password encryption
- Role-based access control (USER/ADMIN)
- Smart post-login redirection

### 2. Flight Search & Booking
- Search across 10 major Indian airports (DEL, BOM, BLR, MAA, HYD, CCU, COK, PNQ, AMD, GOI)
- Filter by price, airline, and stops
- Sort by price, departure time, or duration
- Multiple airlines: IndiGo, Air India, SpiceJet, Vistara, Akasa Air

### 3. Passenger Management
- Automated DOB-to-age calculation
- Automatic categorization: Infant (<2 yrs), Child (2-11 yrs), Adult (12+)
- Nationality selection
- Seat preferences (Window/Middle/Aisle)
- Meal options (Veg/Non-Veg/Jain)

### 4. Booking Management
- "My Bookings" dashboard
- Interactive itinerary modal
- Printable E-Ticket (PDF export)
- 24-hour free cancellation with refund calculation

### 5. Admin Operations Center
- **Route Creator**: Create and schedule new flights
- **Flight Status Management**: SCHEDULED → DELAYED → CANCELLED → COMPLETED
- **Fleet Management**: Aircraft registry with maintenance status
- **Bookings Directory**: System-wide reservations with PNR search
- **Users Directory**: User profile and role management
- **System Diagnostics**: Live status for all services

### 6. AI Assistant Ecosystem
- **Ollama Integration**: Local LLM with flight-specific prompts
- **MCP Server**: 5 live database tools for AI assistants
- **ChatGPT Plugin**: Custom GPT Action for ChatGPT
- **Domain Guardrails**: Enforces flight-only queries

---

## 💻 System Requirements

### Prerequisites
| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17+ | [Adoptium](https://adoptium.net) |
| Maven | 3.9+ | [maven.apache.org](https://maven.apache.org/download.cgi) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | 15/16 | [postgresql.org](https://www.postgresql.org/download/) |
| Angular CLI | 22 | `npm install -g @angular/cli` |

### Optional
| Tool | Purpose |
|------|---------|
| Ollama | Local AI assistant |
| pgAdmin 4 | Database management |
| Docker | Containerized PostgreSQL |

---

## 🚀 Quick Start

### Option A: Real PostgreSQL (Recommended)
```bash
# 1. Create database in pgAdmin
#    Database name: flightbooking

# 2. Configure database credentials
#    Edit: backend/src/main/resources/application.properties

# 3. Install frontend dependencies
cd frontend
npm install

# 4. Start backend
cd ../backend
mvn spring-boot:run

# 5. Start frontend (new terminal)
cd frontend
npm start

# 6. Open browser
#    http://localhost:4200
```

### Option B: Docker PostgreSQL
```bash
# Start PostgreSQL
docker-compose up -d

# Start backend
cd backend
mvn spring-boot:run

# Start frontend
cd frontend
npm start
```

### Option C: H2 In-Memory (Demo)
```bash
# Backend with H2
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Frontend
cd frontend
npm start
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| 🛡️ Admin | admin@skyflow.com | Admin@123 |
| 👤 User | priya@example.com | Admin@123 |

---

## 🌐 API Endpoints

### Backend Services
| Service | URL |
|---------|-----|
| Frontend App | http://localhost:4200 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| H2 Console (dev) | http://localhost:8080/h2-console |

### MCP Server Endpoints
| Protocol | URL | Description |
|----------|-----|-------------|
| GET | `/api/mcp/tools` | List available tools |
| POST | `/api/mcp/call` | Execute MCP tool |
| POST | `/api/mcp/rpc` | JSON-RPC 2.0 protocol |

### ChatGPT Plugin
| Endpoint | Description |
|----------|-------------|
| `/.well-known/ai-plugin.json` | OpenAI plugin manifest |
| `/api/chatgpt/openapi.json` | OpenAPI 3.1.0 spec |

---

## 📁 Project Structure

```
SkyFlow/
├── backend/                          # Spring Boot 3.2, Java 17
│   └── src/main/
│       ├── java/com/flightbooking/
│       │   ├── config/              # Security, CORS, OpenAPI, H2 seeder
│       │   ├── controller/          # REST endpoints
│       │   ├── service/             # Business logic
│       │   ├── repository/          # JPA repositories
│       │   ├── model/               # JPA entities
│       │   ├── dto/                 # Request/Response objects
│       │   └── security/            # JWT filter + utility
│       └── resources/
│           ├── application.properties
│           ├── application-dev.properties
│           └── db/migration/        # Flyway SQL migrations
├── frontend/                        # Angular 22
│   └── src/app/
│       ├── core/                    # Services, guards, interceptors
│       ├── shared/                  # Navbar, footer, flight card
│       └── features/               # auth, home, search, booking, admin
├── mcp/                             # MCP Server & AI integration
├── docs/                            # Project documentation
├── docker-compose.yml
└── HOW_TO_RUN.md
```

---

## 🤖 MCP Tools Available

| Tool | Description |
|------|-------------|
| `search_flights` | Search flights by origin/destination |
| `get_baggage_allowance` | Check baggage rules |
| `get_cancellation_policy` | Check cancellation/refund policy |
| `get_airports_list` | List supported airports |
| `get_passenger_age_rules` | DOB age calculation rules |

---

## 📚 Documentation

- [HOW_TO_RUN.md](../HOW_TO_RUN.md) - Detailed setup instructions
- [MCP README](../mcp/README.md) - MCP server documentation
- [Claude Setup Guide](../mcp/CLAUDE_SETUP_GUIDE.md) - Connect to Claude Desktop
- [ChatGPT Plugin Guide](../mcp/CHATGPT_PLUGIN_GUIDE.md) - ChatGPT integration

---

*Last Updated: August 2026*
