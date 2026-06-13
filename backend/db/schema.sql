-- Drop tables if they exist
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'agent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leads Table
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    source VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    enrichment_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Activity Logs Table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    method VARCHAR(10) NOT NULL,
    url VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    status_code INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_activity_logs_lead_id ON activity_logs(lead_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
