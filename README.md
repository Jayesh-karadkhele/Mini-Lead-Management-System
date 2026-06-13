# Mini Lead Management System (LeadFlow)

LeadFlow is a production-ready, secure, and responsive **Mini Lead Management System** built with **Node.js (Express)**, **Supabase (PostgreSQL)**, and **React (Vite + Bootstrap)**. It features role-based access control (Admin, Manager, Agent), stateful refresh token rotation, an automated least-loaded agent assignment algorithm, background lead enrichment using the RandomUser API, and comprehensive request auditing.

---

## Project Structure
```text
Mini-Lead-Management-System/
├── backend/
│   ├── config/             # Database pool & Swagger configs
│   ├── controllers/        # Request handling and routing logic
│   ├── db/                 # Migrations & Seed scripts
│   ├── middleware/         # Auth, Rate limiting, Audit, and Error handling
│   ├── routes/             # API routes definitions
│   ├── services/           # Business logic & Database queries
│   ├── utils/              # JWT helpers
│   ├── Dockerfile
│   ├── package.json
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with refresh interceptor
│   │   ├── components/     # Layout shells and protected route guards
│   │   ├── context/        # Session AuthContext
│   │   ├── pages/          # Login, Dashboard, Listing, Details, Create, Edit pages
│   │   ├── index.css       # Premium CSS design system
│   │   ├── main.jsx        # App entry & Bootstrap imports
│   │   └── App.jsx         # Routing configuration
│   ├── package.json
│   └── vite.config.js
├── docs/                   # System and design documentation
│   ├── database_design.md
│   ├── architecture_explanation.md
│   └── ai_usage_disclosure.md
├── docker-compose.yml      # Optional local Docker environment setup
└── README.md
```

---

## Detailed Documentation Links
To read more about the technical details of the system, please refer to:
1. **[Database Design & ER Diagram](file:///c:/Users/HP/Desktop/ASSIGNMENT/docs/database_design.md)**: Details on PostgreSQL normalization, foreign keys, index structures, and the ER diagram.
2. **[Architecture Explanation](file:///c:/Users/HP/Desktop/ASSIGNMENT/docs/architecture_explanation.md)**: Explains the PPT/slides layout detailing the layered design, auth flow, scalability, and challenges.
3. **[AI Usage Disclosure](file:///c:/Users/HP/Desktop/ASSIGNMENT/docs/ai_usage_disclosure.md)**: Mandated AI transparency report.

---

## Setup & Running Instructions

### 1. Database Setup (Supabase)
1. Create a free PostgreSQL database instance on [Supabase](https://supabase.com/).
2. Retrieve your **Transaction** or **Session** database connection string (connection pooler) from the Supabase dashboard (`Settings > Database > Connection string > URI`).
3. Set the database URI in the backend `.env` file (see below).

---

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file in the `/backend` folder:
   ```env
   PORT=5000
   DATABASE_URL=your_supabase_postgresql_connection_string
   JWT_ACCESS_SECRET=your_super_secret_access_key
   JWT_REFRESH_SECRET=your_super_secret_refresh_key
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations to initialize the database tables and indexes:
   ```bash
   npm run db:migrate
   ```
5. Seed the database with default roles, agents, and mock leads:
   ```bash
   npm run db:seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```
   *The API will start listening on `http://localhost:5000`.*
   *Interactive API Swagger Documentation will be available at `http://localhost:5000/api-docs`.*

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Create a `.env` file in the `/frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend application will start running at `http://localhost:5173`.*

---

## Default Login Credentials
You can log in to the application dashboard using these seeded user accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Sales Manager** | `manager@company.com` | `managerpassword` |
| **System Admin** | `admin@company.com` | `adminpassword` |
| **Agent Alice** | `alice@company.com` | `agentpassword` |
| **Agent Bob** | `bob@company.com` | `agentpassword` |

---

## Core Features & Logic Summary

### 1. Stateful Refresh Token Rotation
- **Access Token**: Short-lived (15 minutes), passed as a Bearer token in the `Authorization` header to authenticate requests.
- **Refresh Token**: Long-lived (7 days), stored in the database `refresh_tokens` table.
- **Axios Interceptor**: If an access token expires (returns 401/403), the frontend Axios interceptor automatically intercepts the error, calls `/auth/refresh` to rotate the token, updates localStorage, and retries the original request seamlessly.

### 2. Auto-Assignment: Least Loaded Agent
- When a Manager (or Admin) creates a lead and does not assign an agent, the system automatically finds the agent with the lowest active lead load:
  ```sql
  SELECT u.id
  FROM users u
  LEFT JOIN leads l ON u.id = l.assigned_to AND l.status NOT IN ('won', 'lost')
  WHERE u.role = 'agent'
  GROUP BY u.id
  ORDER BY COUNT(l.id) ASC, u.id ASC
  LIMIT 1;
  ```
- The lead is instantly assigned to this agent, and corresponding `lead_created` and `lead_assigned` activity logs are recorded.

### 3. Background Lead Enrichment (RandomUser API)
- On lead creation, the backend spawns a non-blocking background promise that queries `https://randomuser.me/api/`.
- It extracts the profile avatar picture, location, age, gender, and alternate cell phone, saving them under the lead's JSONB `enrichment_data` column.
- This enriched profile is displayed on the Lead Details screen.

### 4. Database Audit Middleware
- Logs every API request's HTTP method, requested URL, client IP address, response status code, and the authenticated user's ID to the `audit_logs` table.

### 5. Rate Limiting Middleware
- Restricts authentication attempts to 15 requests per 15 minutes per IP to prevent brute-force attacks, and general CRUD routes to 100 requests per 15 minutes.
