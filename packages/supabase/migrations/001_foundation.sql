-- ============================================================
-- Donation Management App — Master Schema
-- Migration: 001_foundation
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'chapter_admin', 'volunteer', 'requester');
CREATE TYPE item_condition AS ENUM ('new', 'good', 'fair', 'poor');
CREATE TYPE inventory_category AS ENUM (
  'food', 'clothing', 'hygiene', 'baby_supplies',
  'household', 'medical', 'electronics', 'furniture',
  'school_supplies', 'other'
);
CREATE TYPE help_request_status AS ENUM ('pending', 'assigned', 'in_progress', 'fulfilled', 'cancelled');
CREATE TYPE arrival_status AS ENUM ('pending_verification', 'verified', 'rejected');
CREATE TYPE procurement_status AS ENUM ('pending', 'ordered', 'shipped', 'received', 'flagged');
CREATE TYPE donation_source AS ENUM ('online', 'cash', 'check', 'transfer');
CREATE TYPE shift_status AS ENUM ('scheduled', 'active', 'completed', 'no_show');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Chapters (State-level branches)
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,           -- e.g. "California"
  state_code CHAR(2) NOT NULL UNIQUE,  -- e.g. "CA"
  region TEXT,                          -- e.g. "West"
  address TEXT,
  coordinator_id UUID,                 -- set after profiles exist
  geo_center GEOGRAPHY(POINT, 4326),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'volunteer',
  chapter_id UUID REFERENCES chapters(id),
  avatar_url TEXT,
  phone TEXT,
  preferred_language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK back to profiles for coordinator
ALTER TABLE chapters
  ADD CONSTRAINT fk_coordinator
  FOREIGN KEY (coordinator_id) REFERENCES profiles(id);

-- ============================================================
-- INVENTORY
-- ============================================================

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  category inventory_category NOT NULL DEFAULT 'other',
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit TEXT DEFAULT 'unit',
  fair_market_value DECIMAL(10,2) DEFAULT 0,
  condition item_condition DEFAULT 'good',
  image_url TEXT,
  msrp DECIMAL(10,2),
  source_vendor TEXT,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_inventory_sku_chapter ON inventory(sku, chapter_id);
CREATE INDEX idx_inventory_chapter ON inventory(chapter_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity) WHERE quantity < 10;

-- ============================================================
-- NEW ARRIVALS / REQUESTERS
-- ============================================================

CREATE TABLE new_arrivals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  id_document_url TEXT,
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  status arrival_status DEFAULT 'pending_verification',
  preferred_language TEXT DEFAULT 'en',
  family_size INT DEFAULT 1,
  notes TEXT,
  registered_by UUID NOT NULL REFERENCES profiles(id),
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arrivals_chapter ON new_arrivals(chapter_id);
CREATE INDEX idx_arrivals_status ON new_arrivals(status);

-- ============================================================
-- HELP REQUESTS
-- ============================================================

CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES profiles(id),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  description TEXT NOT NULL,
  category inventory_category DEFAULT 'other',
  urgency_score INT DEFAULT 0 CHECK (urgency_score BETWEEN 0 AND 100),
  status help_request_status DEFAULT 'pending',
  assigned_volunteer_id UUID REFERENCES profiles(id),
  preferred_language TEXT DEFAULT 'en',
  original_text TEXT,
  translated_text TEXT,
  family_size INT DEFAULT 1,
  address TEXT,
  geo_location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_requests_chapter ON help_requests(chapter_id);
CREATE INDEX idx_requests_status ON help_requests(status);
CREATE INDEX idx_requests_urgency ON help_requests(urgency_score DESC);
CREATE INDEX idx_requests_geo ON help_requests USING GIST(geo_location);

-- ============================================================
-- CARE PACKAGES (Templates + Instances)
-- ============================================================

CREATE TABLE care_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  chapter_id UUID REFERENCES chapters(id),
  estimated_value DECIMAL(10,2) DEFAULT 0,
  is_template BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE care_package_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  care_package_id UUID NOT NULL REFERENCES care_packages(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES inventory(id),
  item_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  fair_market_value DECIMAL(10,2) DEFAULT 0
);

-- ============================================================
-- DISTRIBUTIONS
-- ============================================================

CREATE TABLE distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  help_request_id UUID REFERENCES help_requests(id),
  care_package_id UUID REFERENCES care_packages(id),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  distributed_by UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  total_fair_market_value DECIMAL(10,2) DEFAULT 0,
  signature_url TEXT,
  notes TEXT,
  distributed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE distribution_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distribution_id UUID NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory(id),
  item_name TEXT NOT NULL,
  quantity INT NOT NULL,
  fair_market_value DECIMAL(10,2) DEFAULT 0
);

CREATE INDEX idx_distributions_chapter ON distributions(chapter_id);
CREATE INDEX idx_distributions_date ON distributions(distributed_at);

-- ============================================================
-- PROCUREMENT & FINANCE
-- ============================================================

CREATE TABLE procurement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  vendor TEXT NOT NULL,
  order_id_external TEXT,
  total_cost DECIMAL(10,2) NOT NULL,
  status procurement_status DEFAULT 'pending',
  receipt_url TEXT,
  ordered_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  ai_flagged BOOLEAN DEFAULT false,
  ai_flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE procurement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  procurement_id UUID NOT NULL REFERENCES procurement(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  sku TEXT,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

CREATE TABLE cash_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  donor_name TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  source donation_source DEFAULT 'cash',
  receipt_url TEXT,
  notes TEXT,
  received_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cash_donations_chapter ON cash_donations(chapter_id);

-- ============================================================
-- VOLUNTEER MANAGEMENT
-- ============================================================

CREATE TABLE volunteer_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volunteer_id UUID NOT NULL REFERENCES profiles(id),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  hours_logged DECIMAL(5,2) DEFAULT 0,
  geo_checkin GEOGRAPHY(POINT, 4326),
  geo_checkout GEOGRAPHY(POINT, 4326),
  status shift_status DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI INTELLIGENCE TABLES
-- ============================================================

-- Route Optimizations
CREATE TABLE ai_route_optimizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID REFERENCES chapters(id),
  volunteer_id UUID REFERENCES profiles(id),
  optimized_path GEOGRAPHY(LINESTRING, 4326),
  stops JSONB DEFAULT '[]',
  estimated_time_minutes INT,
  total_distance_km DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Price Intelligence
CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  detected_price DECIMAL(10,2),
  source_vendor TEXT,
  product_url TEXT,
  last_scraped TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_market_prices_item ON market_prices USING GIN(item_name gin_trgm_ops);

-- AI Fraud Detection
CREATE TABLE ai_fraud_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  flag_type TEXT, -- 'duplicate_id', 'anomalous_spend', 'suspicious_pattern'
  reasoning TEXT NOT NULL,
  confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Intake Logs (what the vision model detected)
CREATE TABLE ai_intake_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID REFERENCES inventory(id),
  raw_image_url TEXT,
  detected_items JSONB,      -- [{name, confidence, bbox}]
  detected_condition item_condition,
  estimated_fmv DECIMAL(10,2),
  suggested_sku TEXT,
  catalog_match JSONB,        -- {vendor, product_name, msrp, url}
  model_version TEXT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Burn Rate Forecasts (cached daily)
CREATE TABLE burn_rate_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES chapters(id),
  category inventory_category NOT NULL,
  current_quantity INT,
  daily_burn_rate DECIMAL(10,2),
  days_until_depleted INT,
  recommended_action TEXT,
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Impact Reports
CREATE TABLE impact_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id), -- null = org-wide
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  generated_markdown TEXT,
  stats JSONB,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'volunteer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
