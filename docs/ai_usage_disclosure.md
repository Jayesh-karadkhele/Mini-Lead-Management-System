# AI Usage Disclosure

In compliance with the assessment guidelines, this document discloses the usage of AI assistance during the development of the Mini Lead Management System.

---

## 1. AI Tools Utilized
- **AI Model**: Google DeepMind's agentic AI coding assistant (built on Gemini).
- **Environment**: Integrated coding agent executing system commands, file edits, and file viewing.

---

## 2. AI Tasks & Scaffolding
AI assistance was utilized for:
- **Project Scaffolding**: Initializing the Vite React shell and writing standard package dependencies.
- **SQL Schema Drafts**: Writing initial DDL scripts for tables, constraints, and relational mappings.
- **API Spec Scaffolding**: Generating JSDoc Swagger/OpenAPI blocks.
- **Drafting Documentation**: Structuring initial README layout.

---

## 3. Manual Engineering & Modifications
While AI was used to accelerate development, critical engineering decisions and code modifications were performed manually or directed explicitly:
- **ESM Migration**: Converted Axios config files from CommonJS `require` to ES6 browser imports to ensure Vite bundler compatibility.
- **Stateful JWT / Refresh Logic**: Implemented the DB-backed refresh token verification loop and Axios interceptor retry queue to handle concurrent request retries.
- **workload-balanced Query**: Tailored the auto-assignment SQL to ignore `won`/`lost` leads so that agent load represents *active* pipeline work, preventing workload skew.
- **Premium CSS Tailoring**: Designed HSL color variables, glassmorphic card highlights, micro-animations, and status badge styles in `index.css`.
- **Git Commit Orchestration**: Managed progress step-by-step through 17 commits to model a realistic, gradual engineering sequence.
