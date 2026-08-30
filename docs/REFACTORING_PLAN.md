# SkyFlow Refactoring & Cleanup Plan

## 📋 Table of Contents
- [Refactoring Opportunities](#refactoring-opportunities)
- [MCP-Claude Connection Guide](#mcp-claude-connection-guide)
- [Dummy/Unused Files Analysis](#dummy-unused-files-analysis)
- [Documentation Reorganization Plan](#documentation-reorganization-plan)
- [Code Quality Improvements](#code-quality-improvements)

---

## 🔧 Refactoring Opportunities

### 1. Backend Refactoring

#### A. Controller Layer
**Current Issues:**
- Potential code duplication across controllers
- Missing input validation annotations
- Inconsistent error handling patterns

**Recommendations:**
- Add `@Valid` annotations to request bodies
- Create global exception handler (`@ControllerAdvice`)
- Extract common response patterns to base DTO
- Add API versioning (`/api/v1/`)

#### B. Service Layer
**Current Issues:**
- Business logic might be mixed with data access
- Missing transaction management
- No caching for frequently accessed data

**Recommendations:**
- Ensure single responsibility principle
- Add `@Transactional` annotations
- Implement Redis caching for flight searches
- Create service interfaces for testability

#### C. Repository Layer
**Current Issues:**
- Potential N+1 query problems
- Missing query optimization
- No repository-level caching

**Recommendations:**
- Use `@EntityGraph` for fetch joins
- Add database indexes for search fields
- Implement query result caching
- Create custom repository implementations for complex queries

#### D. Security Layer
**Current Issues:**
- JWT token expiration handling
- Missing rate limiting
- No refresh token mechanism

**Recommendations:**
- Implement refresh token rotation
- Add rate limiting to auth endpoints
- Implement token blacklisting
- Add CSRF protection for browser clients

### 2. Frontend Refactoring

#### A. Component Structure
**Current Issues:**
- Potential prop drilling
- Missing OnPush change detection
- Large component files

**Recommendations:**
- Implement smart/dumb component pattern
- Add `OnPush` change detection strategy
- Extract presentational components
- Use content projection for flexible layouts

#### B. State Management
**Current Issues:**
- Multiple service calls for same data
- Missing error handling in components
- No loading state management

**Recommendations:**
- Implement NgRx or Akita for complex state
- Add global error handling interceptor
- Create loading state service
- Implement optimistic updates

#### C. Forms
**Current Issues:**
- Potential missing validators
- Inconsistent form patterns
- No form state persistence

**Recommendations:**
- Use Reactive Forms consistently
- Add custom validators for business rules
- Implement form state persistence
- Add form analytics tracking

### 3. Testing Refactoring

#### A. Unit Tests
**Current Issues:**
- 21 tests may not cover edge cases
- Missing integration tests
- No contract tests for APIs

**Recommendations:**
- Increase test coverage to 80%+
- Add integration tests for critical paths
- Implement contract testing with Pact
- Add mutation testing

#### B. E2E Tests
**Current Issues:**
- No E2E tests configured
- Missing API integration tests
- No performance tests

**Recommendations:**
- Implement Cypress or Playwright E2E tests
- Add API integration test suite
- Implement load testing with k6
- Add visual regression tests

---

## 🤖 MCP-Claude Connection Guide

### Prerequisites
1. Claude Desktop installed ([claude.ai/download](https://claude.ai/download))
2. SkyFlow backend running on port 8080
3. MCP server configured

### Connection Steps

#### Step 1: Verify MCP Server is Running
```bash
# Test MCP tools endpoint
curl http://localhost:8080/api/mcp/tools

# Expected response: JSON with 5 tool definitions
```

#### Step 2: Configure Claude Desktop
**Option A: 1-Click Installer (Recommended)**
```powershell
# Run from project root
.\install-claude-mcp.bat

# Or PowerShell
powershell -ExecutionPolicy Bypass -File install-claude-mcp.ps1
```

**Option B: Manual Configuration**
1. Open Claude Desktop
2. Go to Settings → MCP Servers
3. Add new server:
   - Name: `SkyFlow MCP Server`
   - Command: `curl`
   - Args: `-X POST http://localhost:8080/api/mcp/rpc -H "Content-Type: application/json" -d @-`

#### Step 3: Verify Connection
1. Open Claude Desktop
2. Look for 🔨 (hammer) icon in chat
3. You should see 5 SkyFlow tools:
   - ✈️ `search_flights`
   - 🧳 `get_baggage_allowance`
   - 🔄 `get_cancellation_policy`
   - 🏢 `get_airports_list`
   - 👤 `get_passenger_age_rules`

#### Step 4: Test with Example Prompts
```
"Show me available flights from Delhi (DEL) to Mumbai (BOM)"
"What is the cabin baggage limit on SkyFlow flights?"
"What is the refund if I cancel my ticket 12 hours before departure?"
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Tools not appearing | Restart Claude Desktop after configuration |
| Connection refused | Ensure backend is running on port 8080 |
| Timeout errors | Check firewall/antivirus blocking localhost |
| Authentication error | MCP server is currently unauthenticated |

### Advanced: Remote MCP Server
For exposing MCP server to internet:
```bash
# Start Cloudflare tunnel
cloudflared tunnel --url http://localhost:8080

# Use the generated URL in Claude Desktop configuration
```

---

## 🗑️ Dummy/Unused Files Analysis

### Definitely Remove

| File/Directory | Reason |
|----------------|--------|
| `frontend/README.md` | Auto-generated by Angular CLI, not project-specific |
| `mcp/CHATGPT_PLUGIN_GUIDE.md` | Duplicates information in `PROJECT_DOCUMENTATION.md` |
| `mcp/CLAUDE_SETUP_GUIDE.md` | Duplicates information in `PROJECT_DOCUMENTATION.md` |

### Review Before Removing

| File/Directory | Action |
|----------------|--------|
| `HOW_TO_RUN.md` | Move to `docs/` folder (keep) |
| `PROJECT_DOCUMENTATION.md` | Consolidate into `docs/PROJECT_OVERVIEW.md` |
| `mcp/README.md` | Move to `docs/` folder (keep) |

### Potential Unused Code (Requires Code Review)

**Backend:**
- Unused DTO classes
- Deprecated service methods
- Commented-out code blocks
- Unused configuration properties

**Frontend:**
- Unused component imports
- Dead CSS styles
- Unused Angular modules
- Empty component files

### Files to Keep (Essential)
- `docker-compose.yml` - Docker configuration
- `.gitignore` - Git ignore rules
- `backend/` - All backend source code
- `frontend/src/` - All frontend source code
- `mcp/` - MCP server implementation (minus duplicate docs)

---

## 📁 Documentation Reorganization Plan

### Current Structure
```
SkyFlow/
├── HOW_TO_RUN.md
├── PROJECT_DOCUMENTATION.md
├── frontend/
│   └── README.md
└── mcp/
    ├── README.md
    ├── CHATGPT_PLUGIN_GUIDE.md
    └── CLAUDE_SETUP_GUIDE.md
```

### Proposed Structure
```
SkyFlow/
├── docs/
│   ├── PROJECT_OVERVIEW.md      (NEW - Features & Setup)
│   ├── ARCHITECTURE.md          (NEW - Mermaid diagrams)
│   ├── HOW_TO_RUN.md            (MOVED)
│   ├── MCP_GUIDE.md             (CONSOLIDATED)
│   └── CHANGELOG.md             (NEW - From PROJECT_DOCUMENTATION.md)
├── frontend/
│   └── README.md                (DELETE - Angular CLI default)
├── mcp/
│   ├── README.md                (MOVED to docs/)
│   ├── CHATGPT_PLUGIN_GUIDE.md  (CONSOLIDATED into docs/)
│   └── CLAUDE_SETUP_GUIDE.md    (CONSOLIDATED into docs/)
└── ...
```

### Migration Steps

#### Phase 1: Create Documentation Structure
1. Create `docs/` directory
2. Create `docs/PROJECT_OVERVIEW.md` ✅ (Done)
3. Create `docs/ARCHITECTURE.md` ✅ (Done)

#### Phase 2: Move Existing Files
```bash
# Move HOW_TO_RUN.md to docs/
mv HOW_TO_RUN.md docs/

# Move mcp/README.md to docs/
mv mcp/README.md docs/MCP_README.md
```

#### Phase 3: Consolidate Duplicates
1. Merge `PROJECT_DOCUMENTATION.md` into `docs/PROJECT_OVERVIEW.md`
2. Merge `mcp/CHATGPT_PLUGIN_GUIDE.md` into `docs/MCP_GUIDE.md`
3. Merge `mcp/CLAUDE_SETUP_GUIDE.md` into `docs/MCP_GUIDE.md`

#### Phase 4: Clean Up
1. Delete `frontend/README.md` (Angular CLI default)
2. Delete `PROJECT_DOCUMENTATION.md` (after consolidation)
3. Delete duplicate MCP guides (after consolidation)

#### Phase 5: Update References
1. Update `README.md` (if exists) to reference new docs structure
2. Update any internal links in documentation
3. Update `.gitignore` if needed

---

## 📊 Code Quality Improvements

### 1. Code Style & Conventions

#### Backend (Java/Spring Boot)
- [ ] Enforce Google Java Style Guide
- [ ] Add Checkstyle plugin to Maven
- [ ] Configure SpotBugs for bug detection
- [ ] Add PMD for code smell detection

#### Frontend (Angular/TypeScript)
- [ ] Enforce Angular Style Guide
- [ ] Add Prettier for formatting
- [ ] Configure ESLint with Angular rules
- [ ] Add Husky for pre-commit hooks

### 2. Documentation Standards

- [ ] Add Javadoc to all public methods
- [ ] Create API documentation with Swagger/OpenAPI
- [ ] Add README files to major directories
- [ ] Create CONTRIBUTING.md for contributors

### 3. Security Improvements

- [ ] Add OWASP dependency check
- [ ] Implement security headers
- [ ] Add rate limiting
- [ ] Implement request validation
- [ ] Add audit logging

### 4. Performance Optimizations

- [ ] Add database query monitoring
- [ ] Implement response compression
- [ ] Add CDN for static assets
- [ ] Optimize bundle size
- [ ] Implement lazy loading

### 5. DevOps Improvements

- [ ] Add CI/CD pipeline (GitHub Actions)
- [ ] Implement automated testing
- [ ] Add code coverage reporting
- [ ] Implement blue-green deployments
- [ ] Add monitoring and alerting

---

## 🎯 Implementation Priority

### High Priority (Week 1-2)
1. ✅ Create documentation structure
2. Consolidate duplicate documentation
3. Add global exception handler
4. Implement input validation
5. Add unit test coverage

### Medium Priority (Week 3-4)
1. Refactor component structure
2. Add caching layer
3. Implement rate limiting
4. Add E2E tests
5. Configure CI/CD

### Low Priority (Month 2+)
1. Add monitoring/alerting
2. Implement advanced caching
3. Add performance testing
4. Security hardening
5. Documentation improvements

---

## 📝 Next Steps

### Immediate Actions
1. Review this plan with team
2. Prioritize based on project timeline
3. Create GitHub issues for each task
4. Set up project board for tracking

### Tools to Install
```bash
# Backend
mvn dependency:plugins

# Frontend
npm install --save-dev prettier eslint husky lint-staged

# Documentation
npm install --save-dev markdownlint-cli
```

### Resources
- [Spring Boot Best Practices](https://spring.io/guides)
- [Angular Style Guide](https://angular.dev/reference)
- [MCP Documentation](https://modelcontextprotocol.io)
- [JWT Best Practices](https://jwt.io/introduction/attacks)

---

*Plan Created: August 2026*
*Status: Ready for Review*
