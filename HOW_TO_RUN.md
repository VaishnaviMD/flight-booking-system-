# SkyFlow — Flight Booking System

## Prerequisites (Install these first)

| Tool | Version | Download |
|------|---------|----------|
| Java JDK 17 | 17+ | https://adoptium.net → JDK 17 LTS → Windows x64 → MSI |
| Maven | 3.9+ | https://maven.apache.org/download.cgi → Binary zip → extract to C:\maven → add C:\maven\bin to PATH |
| Node.js | 18+ | https://nodejs.org → LTS version |
| Angular CLI | 22 | Run: `npm install -g @angular/cli` |
| PostgreSQL | 15/16 | Already installed on this laptop |
| pgAdmin 4 | any | Usually installed with PostgreSQL |

---

## OPTION A — Run with Real PostgreSQL (Recommended for this laptop)

### Step 1: Create the database in pgAdmin
1. Open **pgAdmin 4**
2. Right-click **Databases** → **Create** → **Database**
3. Name it: `flightbooking`
4. Click **Save**

### Step 2: Configure the database connection
Open this file:
```
backend/src/main/resources/application.properties
```
Find lines 14-16 and update with your PostgreSQL credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/flightbooking
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRESQL_PASSWORD
```
Replace `postgres` and `YOUR_POSTGRESQL_PASSWORD` with whatever username/password
you set when installing PostgreSQL (default username is usually `postgres`).

### Step 3: Install frontend dependencies
Open a terminal in the project folder:
```
cd frontend
npm install
```
Only needed once. Takes 2-3 minutes on first run.

### Step 4: Start the backend
Open a terminal:
```
cd backend
mvn spring-boot:run
```
**First run takes 3-5 minutes** (Maven downloads dependencies).
When you see:
```
Started FlightBookingApplication in X.XXX seconds
```
The backend is ready. Flyway will **automatically create all tables and load
25 sample flights** into PostgreSQL on first startup.

### Step 5: Start the frontend
Open a second terminal:
```
cd frontend
npm start
```
When you see:
```
** Angular Live Development Server is listening on localhost:4200 **
```
Open browser at: **http://localhost:4200**

---

## OPTION B — Run without PostgreSQL (H2 in-memory, demo only)

Use this when PostgreSQL is not available. Data is lost when backend restarts.

```
# Terminal 1 — Backend with H2
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2 — Frontend
cd frontend
npm start
```

---

## OPTION C — Run with Docker (no PostgreSQL installation needed)

```
# Terminal 1 — Start PostgreSQL via Docker
docker-compose up -d

# Terminal 2 — Backend
cd backend
mvn spring-boot:run

# Terminal 3 — Frontend
cd frontend
npm start
```

---

## Login Credentials (pre-loaded automatically)

| Role  | Email                | Password  |
|-------|----------------------|-----------|
| Admin | admin@skyflow.com    | Admin@123 |
| User  | priya@example.com   | Admin@123 |

---

## URLs

| Service | URL |
|---------|-----|
| App (Frontend) | http://localhost:4200 |
| API (Backend) | http://localhost:8080 |
| Swagger UI (API docs) | http://localhost:8080/swagger-ui.html |
| H2 Console (dev only) | http://localhost:8080/h2-console |

H2 Console settings (dev profile only):
- JDBC URL: `jdbc:h2:mem:flightbooking`
- Username: `sa`
- Password: (leave blank)

---

## What gets created automatically on first startup

Flyway (database migration tool) runs automatically when the backend starts and creates:

- **10 airports**: DEL, BOM, BLR, MAA, HYD, CCU, GOI, PNQ, AMD, COK
- **5 airlines**: IndiGo, Air India, SpiceJet, Vistara, Akasa Air
- **25 flights**: DEL→BOM, BOM→DEL, DEL→BLR, BOM→BLR, DEL→MAA, BLR→HYD, BOM→GOI, DEL→CCU
- **2 users**: admin@skyflow.com (ADMIN) + priya@example.com (USER)

---

## Troubleshooting

**"Port 8080 already in use"**
```
# Windows — find and kill the process
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

**"Port 4200 already in use"**
```
ng serve --port 4201
```
Then update `frontend/src/environments/environment.ts` → `apiUrl` stays the same.

**Maven not found**
Add `C:\maven\bin` to Windows System PATH environment variable.

**Java not found**
Ensure JAVA_HOME points to `C:\Program Files\Eclipse Adoptium\jdk-17.x.x`

**PostgreSQL connection refused**
- Make sure PostgreSQL service is running: search "Services" in Start Menu → find PostgreSQL → Start
- Check username/password in `application.properties`
- Make sure database `flightbooking` exists in pgAdmin

**Frontend shows blank / API errors**
- Make sure backend is running first (port 8080 must be up)
- Check browser console (F12) for CORS errors

---

## Project Structure

```
Flight booking system/
├── backend/                          Spring Boot 3.2, Java 17
│   └── src/main/
│       ├── java/com/flightbooking/
│       │   ├── config/               Security, CORS, OpenAPI, H2 seeder
│       │   ├── controller/           REST endpoints
│       │   ├── service/              Business logic
│       │   ├── repository/           JPA repositories
│       │   ├── model/                JPA entities
│       │   ├── dto/                  Request/Response objects
│       │   └── security/             JWT filter + utility
│       └── resources/
│           ├── application.properties          Main config (PostgreSQL)
│           ├── application-dev.properties      Dev config (H2)
│           └── db/migration/                   Flyway SQL migrations
├── frontend/                         Angular 22
│   └── src/app/
│       ├── core/                     Services, guards, interceptors, models
│       ├── shared/                   Navbar, footer, flight card
│       └── features/                 auth, home, search, booking,
│                                     my-bookings, profile, admin
├── docker-compose.yml                PostgreSQL via Docker
├── .gitignore
└── HOW_TO_RUN.md                     This file
```

---

## GitHub Push Order (one branch per feature)

```
feat/01-project-setup
feat/02-database-schema
feat/03-auth-backend
feat/04-auth-frontend
feat/05-flight-search-backend
feat/06-flight-search-frontend
feat/07-booking-flow
feat/08-my-bookings-profile
feat/09-admin-panel
```
