-- Migration: Create Reservations Table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- RESERVATIONS TABLE
-- Stores customer bookings for desks
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  desk_id UUID NOT NULL REFERENCES desks(id) ON DELETE CASCADE,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end time is after start time
  CONSTRAINT valid_reservation_time CHECK (end_time > start_time),
  
  -- Ensure duration is positive
  CONSTRAINT valid_duration CHECK (duration_hours > 0),
  
  -- Ensure total price is non-negative
  CONSTRAINT valid_price CHECK (total_price >= 0)
);

-- ============================================
-- INDEXES
-- For efficient lookups
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reservations_user_id 
  ON reservations(user_id);

CREATE INDEX IF NOT EXISTS idx_reservations_business_id 
  ON reservations(business_id);

CREATE INDEX IF NOT EXISTS idx_reservations_desk_id 
  ON reservations(desk_id);

CREATE INDEX IF NOT EXISTS idx_reservations_date 
  ON reservations(reservation_date);

CREATE INDEX IF NOT EXISTS idx_reservations_status 
  ON reservations(status);

-- Composite index for checking desk availability
CREATE INDEX IF NOT EXISTS idx_reservations_desk_date 
  ON reservations(desk_id, reservation_date);

-- ============================================
-- EXCLUSION CONSTRAINT FOR DOUBLE-BOOKING PREVENTION
-- Prevents overlapping reservations for the same desk on the same date
-- Requires btree_gist extension for combining = and && operators
-- ============================================
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add exclusion constraint to prevent overlapping time slots
-- Only applies to non-cancelled reservations
ALTER TABLE reservations 
  ADD CONSTRAINT no_overlapping_reservations 
  EXCLUDE USING gist (
    desk_id WITH =,
    reservation_date WITH =,
    tsrange(
      reservation_date + start_time, 
      reservation_date + end_time
    ) WITH &&
  ) WHERE (status != 'cancelled');

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- NOTE: Since we use Clerk for auth (not Supabase Auth), we use permissive
-- policies and handle authorization at the application level via Clerk.
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Allow all reads (app-level auth via Clerk handles who can see what)
CREATE POLICY "Allow all reads" 
  ON reservations FOR SELECT 
  USING (true);

-- Allow all inserts (app validates user is authenticated via Clerk)
CREATE POLICY "Allow all inserts" 
  ON reservations FOR INSERT 
  WITH CHECK (true);

-- Allow all updates (app validates ownership via Clerk)
CREATE POLICY "Allow all updates" 
  ON reservations FOR UPDATE 
  USING (true);

