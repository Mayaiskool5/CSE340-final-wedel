-- Database tables for final

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table for role-based access control
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add role_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN role_id INTEGER REFERENCES roles(id);
    END IF;
END $$;

-- Seed roles (safe to run multiple times)
INSERT INTO roles (role_name, role_description) 
VALUES 
    ('customer', 'A client who browses vehicles and requests service'),
    ('employee', 'Staff member who manages inventory and service status'),
    ('owner', 'Business owner with full control over staff and categories')
ON CONFLICT (role_name) DO NOTHING;

-- Update existing users without a role to default 'user' role
DO $$
DECLARE
    customer_role_id INTEGER;
BEGIN
    SELECT id INTO customer_role_id FROM roles WHERE role_name = 'customer';

    IF customer_role_id IS NOT NULL THEN
        UPDATE users 
        SET role_id = customer_role_id 
        WHERE role_id IS NULL;
    END IF;
END $$;

-- Add a unique slug for each user (for URLs and lookups)
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Organize the inventory (Trucks, SUVs, etc.).
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Vehicles table, Stores core inventory data with a reference to the category.
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    mileage INTEGER,
    specs JSONB, -- Flexible storage for engine, transmission, etc.
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    availability_status BOOLEAN DEFAULT TRUE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a unique slug for each vehicle (for URLs)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Links users to vehicles with a rating system.
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tracks maintenance requests from submission to completion.
-- Create the update function for timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate service_requests with better vehicle tracking
DROP TABLE IF EXISTS service_requests;

CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Allows users to service cars not in the dealership inventory
    vehicle_info TEXT NOT NULL, 
    -- Optional link if they bought it from the lot
    inventory_vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL,
    status request_status DEFAULT 'Submitted',
    employee_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Apply the auto-update trigger
CREATE TRIGGER update_service_request_modtime
    BEFORE UPDATE ON service_requests
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();


--Gets leads from the public contact form
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Each vehicle can have multiple images, with one marked as primary for display purposes.
CREATE TABLE vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE
);

-- Catalog table: links vehicles to owners and stores make/model/year info
CREATE TABLE IF NOT EXISTS catalog (
    id SERIAL PRIMARY KEY,
    vehicle_slug VARCHAR(100) NOT NULL,
    member_slug VARCHAR(100) NOT NULL,
    make_name VARCHAR(50) NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance (optional)
CREATE INDEX IF NOT EXISTS idx_catalog_vehicle_slug ON catalog(vehicle_slug);
CREATE INDEX IF NOT EXISTS idx_catalog_member_slug ON catalog(member_slug);

-- Ensure all required columns and relationships exist for your app

-- USERS TABLE: Add slug if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- VEHICLES TABLE: Add slug, specs, and category_id if missing
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS specs JSONB;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- CATEGORIES TABLE: Already present

-- REVIEWS TABLE: Ensure correct FKs
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE;

-- SERVICE REQUESTS TABLE: Ensure correct FKs and status
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Submitted';
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS employee_notes TEXT;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS inventory_vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL;

-- CONTACT MESSAGES TABLE: Already present

-- VEHICLE IMAGES TABLE: Ensure correct FK
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE;
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- ACTIVITY LOGS TABLE: For owner/admin
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATALOG TABLE: For linking vehicles to owners (optional, if used)
CREATE TABLE IF NOT EXISTS catalog (
    id SERIAL PRIMARY KEY,
    vehicle_slug VARCHAR(100) NOT NULL,
    member_slug VARCHAR(100) NOT NULL,
    make_name VARCHAR(50) NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEPARTMENTS TABLE: Only if you need it
-- CREATE TABLE IF NOT EXISTS departments (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(100) NOT NULL,
--     code VARCHAR(20) UNIQUE NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

