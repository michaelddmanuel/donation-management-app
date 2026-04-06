-- ============================================================
-- Migration: 004_whatsapp_qr_donor
-- Adds: WhatsApp conversations, QR care packages, Donor portal
-- ============================================================

-- ============================================================
-- WHATSAPP / SMS CONVERSATIONS
-- ============================================================

CREATE TYPE conversation_channel AS ENUM ('whatsapp', 'sms');
CREATE TYPE conversation_status AS ENUM ('active', 'resolved', 'expired');

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel conversation_channel NOT NULL,
  phone_number TEXT NOT NULL,
  profile_id UUID REFERENCES profiles(id),       -- linked after verification
  chapter_id UUID REFERENCES chapters(id),
  language TEXT DEFAULT 'en',
  status conversation_status DEFAULT 'active',
  help_request_id UUID REFERENCES help_requests(id), -- auto-created request
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  body TEXT NOT NULL,
  translated_body TEXT,
  media_url TEXT,
  twilio_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_phone ON conversations(phone_number);
CREATE INDEX idx_conversations_chapter ON conversations(chapter_id);
CREATE INDEX idx_conv_messages_conv ON conversation_messages(conversation_id);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select ON conversations FOR SELECT USING (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);
CREATE POLICY conversations_insert ON conversations FOR INSERT WITH CHECK (true); -- edge function inserts
CREATE POLICY conv_messages_select ON conversation_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = conversation_messages.conversation_id
    AND (is_super_admin() OR c.chapter_id = auth_chapter_id())
  )
);
CREATE POLICY conv_messages_insert ON conversation_messages FOR INSERT WITH CHECK (true);

-- ============================================================
-- QR CODES FOR CARE PACKAGES
-- ============================================================

CREATE TABLE care_package_qr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  care_package_id UUID NOT NULL REFERENCES care_packages(id),
  qr_code TEXT NOT NULL UNIQUE,             -- UUID token embedded in QR
  distribution_id UUID REFERENCES distributions(id), -- set upon distribution
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'assigned', 'distributed', 'void')),
  generated_by UUID REFERENCES profiles(id),
  scanned_by UUID REFERENCES profiles(id),  -- volunteer who scanned
  scanned_at TIMESTAMPTZ,
  recipient_id UUID REFERENCES profiles(id),
  recipient_viewed_at TIMESTAMPTZ,          -- when recipient scanned
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qr_code ON care_package_qr(qr_code);
CREATE INDEX idx_qr_status ON care_package_qr(status);

ALTER TABLE care_package_qr ENABLE ROW LEVEL SECURITY;

CREATE POLICY qr_select ON care_package_qr FOR SELECT USING (
  is_super_admin()
  OR recipient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM care_packages cp WHERE cp.id = care_package_qr.care_package_id
    AND (cp.chapter_id = auth_chapter_id() OR cp.chapter_id IS NULL)
  )
);
CREATE POLICY qr_insert ON care_package_qr FOR INSERT WITH CHECK (
  is_super_admin()
  OR auth_role() IN ('chapter_admin', 'volunteer')
);
CREATE POLICY qr_update ON care_package_qr FOR UPDATE USING (
  is_super_admin()
  OR auth_role() IN ('chapter_admin', 'volunteer')
);

-- ============================================================
-- DONOR PORTAL (Integrated — any user can be a donor)
-- ============================================================

CREATE TYPE donation_type AS ENUM ('monetary', 'in_kind', 'sponsorship');

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES profiles(id),
  chapter_id UUID REFERENCES chapters(id),     -- NULL = org-wide
  type donation_type NOT NULL DEFAULT 'monetary',
  amount DECIMAL(10,2),                         -- for monetary
  items_description TEXT,                       -- for in_kind
  care_package_id UUID REFERENCES care_packages(id), -- for sponsorship
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT CHECK (recurring_interval IN ('weekly', 'monthly', 'quarterly', 'annually')),
  tax_receipt_url TEXT,
  tax_receipt_generated BOOLEAN DEFAULT false,
  fair_market_value DECIMAL(10,2),              -- for in_kind tax receipts
  message TEXT,                                 -- donor message
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE donor_impact_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES profiles(id),
  donation_id UUID REFERENCES donations(id),
  impact_summary TEXT,                          -- AI-generated personalized impact
  families_helped INT,
  items_distributed INT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tax_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES donations(id),
  donor_id UUID NOT NULL REFERENCES profiles(id),
  receipt_number TEXT NOT NULL UNIQUE,
  tax_year INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  fair_market_value DECIMAL(10,2),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_chapter ON donations(chapter_id);
CREATE INDEX idx_tax_receipts_donor ON tax_receipts(donor_id);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_impact_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_receipts ENABLE ROW LEVEL SECURITY;

-- Donors can see their own donations; admins see all in their chapter
CREATE POLICY donations_select ON donations FOR SELECT USING (
  is_super_admin()
  OR donor_id = auth.uid()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);
CREATE POLICY donations_insert ON donations FOR INSERT WITH CHECK (
  donor_id = auth.uid() OR is_super_admin()
);

CREATE POLICY impact_views_select ON donor_impact_views FOR SELECT USING (
  is_super_admin() OR donor_id = auth.uid()
);

CREATE POLICY tax_receipts_select ON tax_receipts FOR SELECT USING (
  is_super_admin() OR donor_id = auth.uid()
);

-- ============================================================
-- ADD 'donor' to user_role (anyone can toggle donor mode)
-- We keep existing roles and add a flag instead
-- ============================================================

ALTER TABLE profiles ADD COLUMN is_donor BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN donor_since TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN total_donated DECIMAL(12,2) DEFAULT 0;

-- ============================================================
-- COMMAND CONSOLE AUDIT LOG (for Super Admin spotlight queries)
-- ============================================================

CREATE TABLE command_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  query TEXT NOT NULL,
  parsed_intent JSONB,     -- AI-parsed intent
  result_summary TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE command_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY command_log_select ON command_log FOR SELECT USING (
  is_super_admin() OR user_id = auth.uid()
);
CREATE POLICY command_log_insert ON command_log FOR INSERT WITH CHECK (
  user_id = auth.uid()
);
