# 🚀 SkyFlow Flight Booking System — How to Run Guide

---

## 💻 System Requirements & How to Run on Another Laptop

If you or your friend want to clone and run this project on another laptop from GitHub, follow this quick setup guide:

### 1. Prerequisites to Install
Make sure the following software is installed on the laptop:
1. **Java JDK 17 or higher** (e.g. OpenJDK 17 or Oracle JDK 17/21)
2. **Apache Maven 3.8+** (Run `mvn -v` to verify)
3. **Node.js 18+ and npm** (Download from [nodejs.org](https://nodejs.org/), run `node -v` and `npm -v` to verify)
4. **PostgreSQL 14+** (Ensure PostgreSQL service is running on port `5432`)
5. **Ollama** *(Optional, for local AI Assistant)*:
   - Download and install from [ollama.ai](https://ollama.com/)
   - Open terminal and run: `ollama pull llama3.2:1b`

---

### 2. Step-by-Step Setup Instructions

#### Step 1: Clone the GitHub Repository
```bash
git clone https://github.com/VaishnaviMD/flight-booking-system-.git
cd flight-booking-system-
```

#### Step 2: Setup the Database
1. Open PostgreSQL (pgAdmin or `psql`) and create a database named `flightbooking`:
   ```sql
   CREATE DATABASE flightbooking;
   ```
2. Check your PostgreSQL username and password in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/flightbooking
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_PG_PASSWORD
   ```
   *(Update `YOUR_PG_PASSWORD` with your local PostgreSQL password if different).*

#### Step 3: Run the Spring Boot Backend
Open a terminal in the project root:
```bash
mvn spring-boot:run -f backend/pom.xml
```
*The backend will automatically create tables and seed initial flight, airport, and airline data using Flyway migrations on port `8080`.*

#### Step 4: Run the Angular Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm start
```
*The frontend web app will compile and start at `http://localhost:4200/`.*

#### Step 5: Run Automated Unit Tests (21 Unit Tests)
```bash
mvn test -f backend/pom.xml
```

#### Step 6: Access the Application & Default Credentials
- **Web Application**: [http://localhost:4200](http://localhost:4200)
- **AI Assistant**: [http://localhost:4200/assistant](http://localhost:4200/assistant)
- **Admin Operations Console**: [http://localhost:4200/admin](http://localhost:4200/admin)
- **ChatGPT Plugin Spec**: [http://localhost:8080/api/chatgpt/openapi.json](http://localhost:8080/api/chatgpt/openapi.json)
- **Backend API & Swagger Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

#### Default Accounts:
- 🛡️ **Admin Account**: `admin@skyflow.com` / `Admin@123` *(Redirects to Admin Console)*
- 👤 **Customer Account**: `priya@example.com` / `Admin@123` *(Redirects to Flight Search)*
