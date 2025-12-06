-- Migration: Create Desks and Date Availability Tables
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- DESKS TABLE
-- Individual bookable desks within a business
-- ============================================
CREATE TABLE IF NOT EXISTS desks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure desk names are unique within each business
  UNIQUE(business_id, name)
);

CREATE INDEX IF NOT EXISTS idx_desks_business_id ON desks(business_id);

-- ============================================
-- DATE AVAILABILITY TABLE
-- Calendar-based availability where businesses mark specific dates/times
-- Businesses click on calendar dates and add time slots
-- ============================================
CREATE TABLE IF NOT EXISTS date_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One entry per day per business
  UNIQUE(business_id, available_date),
  
  -- Ensure close time is after open time
  CONSTRAINT valid_time_range CHECK (close_time > open_time)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_date_availability_business_id 
  ON date_availability(business_id);

CREATE INDEX IF NOT EXISTS idx_date_availability_date 
  ON date_availability(available_date);

CREATE INDEX IF NOT EXISTS idx_date_availability_business_date 
  ON date_availability(business_id, available_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Desks RLS
ALTER TABLE desks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Desks are viewable by everyone" 
  ON desks FOR SELECT USING (true);

CREATE POLICY "Business owners can insert desks" 
  ON desks FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can update desks" 
  ON desks FOR UPDATE USING (true);

CREATE POLICY "Business owners can delete desks" 
  ON desks FOR DELETE USING (true);

-- Date Availability RLS
ALTER TABLE date_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Date availability is viewable by everyone" 
  ON date_availability FOR SELECT USING (true);

CREATE POLICY "Business owners can insert date availability" 
  ON date_availability FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can update date availability" 
  ON date_availability FOR UPDATE USING (true);

CREATE POLICY "Business owners can delete date availability" 
  ON date_availability FOR DELETE USING (true);

-- ============================================
-- TRIGGER: Update updated_at on desks
-- ============================================
CREATE TRIGGER update_desks_updated_at
  BEFORE UPDATE ON desks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
