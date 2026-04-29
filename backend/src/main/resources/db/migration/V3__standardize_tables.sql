-- V3__standardize_tables.sql

-- 1. Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Rename password to password_hash if password exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
        ALTER TABLE users RENAME COLUMN password TO password_hash;
    END IF;
END $$;

-- 2. Update tickets table
-- Rename order_id to pagbank_order_id if order_id exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='order_id') THEN
        ALTER TABLE tickets RENAME COLUMN order_id TO pagbank_order_id;
    END IF;
END $$;

-- Rename status to payment_status if status exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='status') THEN
        ALTER TABLE tickets RENAME COLUMN status TO payment_status;
    END IF;
END $$;

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_uuid UUID UNIQUE DEFAULT gen_random_uuid();
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Indices for architecture compliance
CREATE INDEX IF NOT EXISTS idx_tickets_pagbank_order ON tickets(pagbank_order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_uuid ON tickets(ticket_uuid);
