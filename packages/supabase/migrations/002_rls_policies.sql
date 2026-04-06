-- ============================================================
-- Donation Management App — Row Level Security
-- Migration: 002_rls_policies
-- ============================================================
-- 
-- POLICY MATRIX:
-- super_admin  → Full access to everything, all chapters
-- chapter_admin → CRUD only within their assigned chapter
-- volunteer    → Read inventory + manage arrivals/distributions in their chapter
-- requester    → Read own data, create help requests
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_arrivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_package_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_route_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE burn_rate_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS (used in policies)
-- ============================================================

-- Get the role of the current authenticated user
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get the chapter_id of the current authenticated user
CREATE OR REPLACE FUNCTION auth_chapter_id()
RETURNS UUID AS $$
  SELECT chapter_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================

-- Everyone can read profiles in their chapter; super_admin sees all
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  is_super_admin()
  OR id = auth.uid()
  OR (chapter_id = auth_chapter_id() AND auth_role() IN ('chapter_admin', 'volunteer'))
);

-- Users can update their own profile
CREATE POLICY profiles_update_self ON profiles FOR UPDATE USING (
  id = auth.uid()
) WITH CHECK (
  id = auth.uid()
  -- Prevent role escalation: only super_admin can change roles
  AND (role = (SELECT role FROM profiles WHERE id = auth.uid()) OR is_super_admin())
);

-- Super admin can update any profile
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE USING (
  is_super_admin()
);

-- ============================================================
-- CHAPTERS
-- ============================================================

-- Everyone can read chapters (needed for dropdowns, etc.)
CREATE POLICY chapters_select ON chapters FOR SELECT USING (true);

-- Only super_admin can create/update/delete chapters
CREATE POLICY chapters_insert ON chapters FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY chapters_update ON chapters FOR UPDATE USING (is_super_admin());
CREATE POLICY chapters_delete ON chapters FOR DELETE USING (is_super_admin());

-- ============================================================
-- INVENTORY
-- Key policy: chapter_admin for "California" can ONLY see
-- inventory within the California chapter.
-- ============================================================

CREATE POLICY inventory_select ON inventory FOR SELECT USING (
  is_super_admin()
  OR chapter_id = auth_chapter_id()
);

CREATE POLICY inventory_insert ON inventory FOR INSERT WITH CHECK (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

CREATE POLICY inventory_update ON inventory FOR UPDATE USING (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

CREATE POLICY inventory_delete ON inventory FOR DELETE USING (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

-- ============================================================
-- NEW ARRIVALS
-- ============================================================

CREATE POLICY arrivals_select ON new_arrivals FOR SELECT USING (
  is_super_admin()
  OR chapter_id = auth_chapter_id()
);

CREATE POLICY arrivals_insert ON new_arrivals FOR INSERT WITH CHECK (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

CREATE POLICY arrivals_update ON new_arrivals FOR UPDATE USING (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

-- ============================================================
-- HELP REQUESTS
-- ============================================================

CREATE POLICY requests_select ON help_requests FOR SELECT USING (
  is_super_admin()
  OR chapter_id = auth_chapter_id()
  OR requester_id = auth.uid()
);

CREATE POLICY requests_insert ON help_requests FOR INSERT WITH CHECK (
  is_super_admin()
  OR requester_id = auth.uid()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

CREATE POLICY requests_update ON help_requests FOR UPDATE USING (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

-- ============================================================
-- CARE PACKAGES
-- ============================================================

CREATE POLICY care_packages_select ON care_packages FOR SELECT USING (
  is_super_admin()
  OR chapter_id = auth_chapter_id()
  OR chapter_id IS NULL -- org-wide templates
);

CREATE POLICY care_packages_insert ON care_packages FOR INSERT WITH CHECK (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY care_package_items_select ON care_package_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM care_packages cp
    WHERE cp.id = care_package_items.care_package_id
    AND (is_super_admin() OR cp.chapter_id = auth_chapter_id() OR cp.chapter_id IS NULL)
  )
);

CREATE POLICY care_package_items_insert ON care_package_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM care_packages cp
    WHERE cp.id = care_package_items.care_package_id
    AND (is_super_admin() OR (auth_role() = 'chapter_admin' AND cp.chapter_id = auth_chapter_id()))
  )
);

-- ============================================================
-- DISTRIBUTIONS
-- ============================================================

CREATE POLICY distributions_select ON distributions FOR SELECT USING (
  is_super_admin()
  OR chapter_id = auth_chapter_id()
  OR recipient_id = auth.uid()
);

CREATE POLICY distributions_insert ON distributions FOR INSERT WITH CHECK (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

CREATE POLICY distribution_items_select ON distribution_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM distributions d
    WHERE d.id = distribution_items.distribution_id
    AND (is_super_admin() OR d.chapter_id = auth_chapter_id())
  )
);

CREATE POLICY distribution_items_insert ON distribution_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM distributions d
    WHERE d.id = distribution_items.distribution_id
    AND (is_super_admin() OR (auth_role() IN ('chapter_admin', 'volunteer') AND d.chapter_id = auth_chapter_id()))
  )
);

-- ============================================================
-- PROCUREMENT
-- ============================================================

CREATE POLICY procurement_select ON procurement FOR SELECT USING (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY procurement_insert ON procurement FOR INSERT WITH CHECK (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY procurement_update ON procurement FOR UPDATE USING (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY procurement_items_select ON procurement_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM procurement p
    WHERE p.id = procurement_items.procurement_id
    AND (is_super_admin() OR (auth_role() = 'chapter_admin' AND p.chapter_id = auth_chapter_id()))
  )
);

CREATE POLICY procurement_items_insert ON procurement_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM procurement p
    WHERE p.id = procurement_items.procurement_id
    AND (is_super_admin() OR (auth_role() = 'chapter_admin' AND p.chapter_id = auth_chapter_id()))
  )
);

-- ============================================================
-- CASH DONATIONS
-- ============================================================

CREATE POLICY cash_donations_select ON cash_donations FOR SELECT USING (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY cash_donations_insert ON cash_donations FOR INSERT WITH CHECK (
  is_super_admin()
  OR (auth_role() IN ('chapter_admin', 'volunteer') AND chapter_id = auth_chapter_id())
);

-- ============================================================
-- VOLUNTEER SHIFTS
-- ============================================================

CREATE POLICY shifts_select ON volunteer_shifts FOR SELECT USING (
  is_super_admin()
  OR volunteer_id = auth.uid()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY shifts_insert ON volunteer_shifts FOR INSERT WITH CHECK (
  is_super_admin()
  OR volunteer_id = auth.uid()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY shifts_update ON volunteer_shifts FOR UPDATE USING (
  is_super_admin()
  OR volunteer_id = auth.uid()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

-- ============================================================
-- AI TABLES (super_admin + chapter_admin read-only)
-- ============================================================

CREATE POLICY fraud_flags_select ON ai_fraud_flags FOR SELECT USING (
  is_super_admin()
  OR auth_role() = 'chapter_admin'
);

CREATE POLICY fraud_flags_update ON ai_fraud_flags FOR UPDATE USING (
  is_super_admin()
);

CREATE POLICY routes_select ON ai_route_optimizations FOR SELECT USING (
  is_super_admin()
  OR volunteer_id = auth.uid()
  OR (auth_role() = 'chapter_admin' AND branch_id = auth_chapter_id())
);

CREATE POLICY burn_rate_select ON burn_rate_forecasts FOR SELECT USING (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND chapter_id = auth_chapter_id())
);

CREATE POLICY impact_reports_select ON impact_reports FOR SELECT USING (
  is_super_admin()
  OR (auth_role() = 'chapter_admin' AND (chapter_id = auth_chapter_id() OR chapter_id IS NULL))
);
