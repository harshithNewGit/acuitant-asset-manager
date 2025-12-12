-- Asset Manager Database Schema
-- Run this file to create all necessary tables

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(100) NOT NULL UNIQUE,
    asset_name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    fa_ledger VARCHAR(100),
    date_of_purchase DATE,
    cost_of_asset DECIMAL(12, 2),
    useful_life INTERVAL,
    number_marked VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    assigned_to VARCHAR(255),
    location VARCHAR(255),
    closing_stock_rs DECIMAL(12, 2),
    status VARCHAR(50),
    remarks TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_subscription BOOLEAN DEFAULT FALSE,
    subscription_vendor TEXT,
    subscription_renewal_date DATE,
    subscription_billing_cycle TEXT,
    subscription_url TEXT
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done);

-- Insert some sample data (optional)
-- INSERT INTO categories (name, description) VALUES 
--     ('Electronics', 'Electronic devices and equipment'),
--     ('Furniture', 'Office furniture and fixtures'),
--     ('Software', 'Software licenses and subscriptions')
-- ON CONFLICT (name) DO NOTHING;

