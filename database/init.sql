-- MediVault Database - Tables and Indexes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL, age INTEGER, phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), hospital_id VARCHAR(50) UNIQUE NOT NULL,
    hospital_name VARCHAR(255) NOT NULL, city VARCHAR(100), address TEXT,
    email VARCHAR(255), phone VARCHAR(50), status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE private_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL, hospital_private_key_index VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(), expires_at TIMESTAMP, is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, hospital_id)
);

CREATE TABLE patient_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL, visit_date TIMESTAMP DEFAULT NOW(),
    location VARCHAR(255), doctor_name VARCHAR(255), case_name VARCHAR(255), 
    visit_notes TEXT, is_emergency BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), visit_id UUID REFERENCES patient_visits(id) ON DELETE CASCADE,
    case_type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, content TEXT NOT NULL,
    file_urls JSONB, created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE records_consent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sharing_type VARCHAR(50) NOT NULL, target_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    consent_duration_days INTEGER NOT NULL, requested_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP, expires_at TIMESTAMP, status VARCHAR(20) DEFAULT 'pending',
    associated_hospital_private_key VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE emergency_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    requesting_hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    requester_name VARCHAR(255) NOT NULL, requester_cell VARCHAR(50) NOT NULL, reason TEXT NOT NULL,
    granted_at TIMESTAMP DEFAULT NOW(), expires_at TIMESTAMP NOT NULL, status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE emergency_limited_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    access_id UUID REFERENCES emergency_access(id) ON DELETE CASCADE, blood_group VARCHAR(10),
    allergies TEXT[] DEFAULT '[]', current_medications TEXT[] DEFAULT '[]',
    emergency_contact_name VARCHAR(255), emergency_contact_phone VARCHAR(50), organ_donor BOOLEAN DEFAULT FALSE
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id),
    hospital_id UUID REFERENCES hospitals(id), action_type VARCHAR(50) NOT NULL,
    ip_address INET, user_agent TEXT, metadata JSONB, created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hospitals_hospital_id ON hospitals(hospital_id);
CREATE INDEX idx_private_keys_user ON private_keys(user_id);
CREATE INDEX idx_private_keys_hospital ON private_keys(hospital_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
