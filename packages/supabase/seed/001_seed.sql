-- ============================================================
-- Seed Data — Demo Chapters + Sample Inventory
-- Run AFTER migrations
-- ============================================================

-- Chapters
INSERT INTO chapters (name, state_code, region, is_active) VALUES
  ('California', 'CA', 'West', true),
  ('Texas', 'TX', 'South', true),
  ('New York', 'NY', 'Northeast', true),
  ('Florida', 'FL', 'Southeast', true),
  ('Illinois', 'IL', 'Midwest', true),
  ('Oklahoma', 'OK', 'South', true),
  ('Ohio', 'OH', 'Midwest', true),
  ('Georgia', 'GA', 'Southeast', true),
  ('Arizona', 'AZ', 'West', true),
  ('Washington', 'WA', 'West', true),
  ('Virginia', 'VA', 'East', true),
  ('Colorado', 'CO', 'West', true);

-- Care Package Templates (org-wide)
INSERT INTO care_packages (name, chapter_id, estimated_value, is_template) VALUES
  ('Basic Welcome Kit', NULL, 85.00, true),
  ('Family Starter Pack', NULL, 175.00, true),
  ('Baby Care Bundle', NULL, 120.00, true),
  ('Winter Survival Kit', NULL, 95.00, true),
  ('School Ready Pack', NULL, 65.00, true);
