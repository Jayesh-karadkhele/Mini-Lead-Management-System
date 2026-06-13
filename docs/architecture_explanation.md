# Architecture Explanation (Slide-by-Slide Outline)

This document provides a slide-by-slide presentation outline explaining the architectural design, security mechanisms, and scalability decisions implemented in LeadFlow.

---

## Slide 1: Title Slide
### LeadFlow: Mini Lead Management System
- **Presenter**: Jayesh Karadkhele / Developer Assessment
- **Core Stack**: Node.js, Express, Supabase (PostgreSQL), React (Vite), Bootstrap 5.
- **Key Focus**: Secure Authentication, Automation, Layered Architecture, and Request Auditing.

---

## Slide 2: Layered Project Architecture
### Layered Separation of Concerns (SoC)
- **Routing Layer**: Parses URL paths, rates-limits requests, and maps endpoints to controllers.
- **Middleware Pipeline**: Inspects request credentials (JWT), validates roles, writes audits, and catches runtime errors globally.
- **Controller Layer**: Decouples network details (request/response) from core business transactions.
- **Service Layer**: House for pure business logic (auto-assignment queries, RandomUser API enrichment, session management).
- **Database Layer**: Exposes connection pooling (`pg.Pool`) to connect to Supabase PostgreSQL.

---

## Slide 3: Folder Structure & Clean Code
### Clean, Human-Written Organization
- **Separation of Frontend/Backend**: Keeps client and server isolated for easier deployments and maintenance.
- **Feature Isolation**: Routers and controllers are grouped by features (e.g., Auth, Leads, Activities).
- **No Boilerplate / Excessive Comments**: Focuses on clean code readability, realistic naming conventions, and robust error handling.

---

## Slide 4: Stateful Authentication & Token Refresh Flow
### Secure Dual-Token Session Management
- **Short-Lived Access Tokens**: Signed with user details (id, name, role), expires in 15 minutes. Verified in memory.
- **Stateful Refresh Tokens**: Signed with user ID, stored in the database `refresh_tokens` table. Expires in 7 days.
- **Transparent Token Rotation**:
  1. Frontend Axios client interceptor captures token expiry (returns 401/403).
  2. Sends request to `/api/auth/refresh` with refresh token.
  3. If valid and matches active database token, server returns a new access token.
  4. Interceptor transparently retries the failed original request.
- **Revocation**: Logging out deletes the refresh token from the database, instantly invalidating the session.

---

## Slide 5: Database Design Decisions
### 3NF Normalization & Performance Indexes
- **Five Normalized Tables**:
  - `users`: User metadata & roles.
  - `refresh_tokens`: Active sessions tracker.
  - `leads`: Lead attributes and JSONB enrichment object.
  - `activity_logs`: Lead event history tracking.
  - `audit_logs`: Global request logging.
- **Performance Indexes**:
  - Index on `users(email)` for sub-millisecond login checks.
  - Index on `leads(assigned_to)` to speed up workload checks.
  - Index on `leads(status)` & `leads(source)` for tabular sorting.

---

## Slide 6: Lead Auto-Assignment Logic
### Least Loaded Agent Algorithm
- **Requirement**: Auto-assign leads created by Managers/Admins to the agent with the lowest workload.
- **Database Load Metric**: Active workload is defined as the count of leads currently assigned to an agent that are not in a final state (`won` or `lost`).
- **Algorithm Query**:
  ```sql
  SELECT u.id
  FROM users u
  LEFT JOIN leads l ON u.id = l.assigned_to AND l.status NOT IN ('won', 'lost')
  WHERE u.role = 'agent'
  GROUP BY u.id
  ORDER BY COUNT(l.id) ASC, u.id ASC
  LIMIT 1;
  ```
- **Result**: The lead is automatically assigned, and `lead_created` + `lead_assigned` activities are logged immediately.

---

## Slide 7: Scalability & Performance
### Production-Ready Reliability Considerations
- **Non-blocking Background Processing**: Geolocation and RandomUser API enrichment runs as an asynchronous background promise, keeping lead creation response times fast.
- **Database Connection Pooling**: Prevents connection exhaustion by reuse of connections.
- **Audit & Rate Limiting**: Global audit log table tracks security incidents, while rate limiters prevent dictionary attacks on `/auth` endpoints.

---

## Slide 8: Challenges Faced & Future Improvements
### Next Steps with More Time
- **Challenges**:
  - Handling race conditions on concurrent lead creation (solved by query-level ordering, but could be enhanced with row-level locks or transaction isolation).
  - Browser ESM bundling compatibility with standard require syntax.
- **Future Enhancements**:
  - **Redis Caching**: Cache agent workloads and leads listing queries.
  - **WebSockets / Live Updates**: Real-time push notifications to agents when they are assigned a lead.
  - **Background Worker Queues**: Move lead enrichment to a Redis-backed worker queue (e.g., BullMQ) for robust retry policies.
