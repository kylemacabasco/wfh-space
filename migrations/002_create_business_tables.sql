-- Migration: Create Business, Desks, and Availability Tables
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- BUSINESSES TABLE
-- Stores business/workspace profiles
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);

-- ============================================
-- DESKS TABLE
-- Individual bookable spots within a business
-- ============================================
CREATE TABLE IF NOT EXISTS desks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER DEFAULT 1,
  amenities TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_desks_business_id ON desks(business_id);
CREATE INDEX IF NOT EXISTS idx_desks_is_active ON desks(is_active);

-- ============================================
-- AVAILABILITY TABLE
-- Weekly operating hours for each business
-- day_of_week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
-- ============================================
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one entry per day per business
  UNIQUE(business_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_availability_business_id ON availability(business_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Businesses RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses are viewable by everyone" 
  ON businesses FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can view their own businesses" 
  ON businesses FOR SELECT USING (owner_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Business owners can insert their own businesses" 
  ON businesses FOR INSERT WITH CHECK (true);

CREATE POLICY "Business owners can update their own businesses" 
  ON businesses FOR UPDATE USING (owner_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Business owners can delete their own businesses" 
  ON businesses FOR DELETE USING (owner_id IN (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- Desks RLS
ALTER TABLE desks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Desks are viewable by everyone" 
  ON desks FOR SELECT USING (is_active = true);

CREATE POLICY "Business owners can manage desks" 
  ON desks FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id IN (
        SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    )
  );

-- Availability RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is viewable by everyone" 
  ON availability FOR SELECT USING (true);

CREATE POLICY "Business owners can manage availability" 
  ON availability FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id IN (
        SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
      )
    )
  );

-- ============================================
-- HELPER FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_desks_updated_at
  BEFORE UPDATE ON desks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
