-- ============================================================
-- Donation Management App — Analytics Functions
-- Migration: 003_analytics_functions
-- ============================================================

-- ============================================================
-- 1. FAIR MARKET VALUE: Last 30 Days, Grouped by Category
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_fmv_last_30_days(
  p_chapter_id UUID DEFAULT NULL  -- NULL = all chapters
)
RETURNS TABLE (
  category inventory_category,
  total_items_distributed BIGINT,
  total_fair_market_value DECIMAL(12,2),
  avg_item_value DECIMAL(10,2),
  unique_recipients BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    di.item_name::inventory_category AS category, -- we join through inventory
    SUM(di.quantity)::BIGINT AS total_items_distributed,
    SUM(di.fair_market_value * di.quantity)::DECIMAL(12,2) AS total_fair_market_value,
    CASE
      WHEN SUM(di.quantity) > 0
      THEN (SUM(di.fair_market_value * di.quantity) / SUM(di.quantity))::DECIMAL(10,2)
      ELSE 0
    END AS avg_item_value,
    COUNT(DISTINCT d.recipient_id)::BIGINT AS unique_recipients
  FROM distributions d
  JOIN distribution_items di ON d.id = di.distribution_id
  JOIN inventory inv ON di.inventory_item_id = inv.id
  WHERE d.distributed_at >= NOW() - INTERVAL '30 days'
    AND (p_chapter_id IS NULL OR d.chapter_id = p_chapter_id)
  GROUP BY inv.category
  ORDER BY total_fair_market_value DESC;
END;
$$;

-- ============================================================
-- 2. BURN RATE CALCULATOR
-- Computes daily consumption rate per category per chapter
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_burn_rates(
  p_lookback_days INT DEFAULT 30
)
RETURNS TABLE (
  chapter_id UUID,
  chapter_name TEXT,
  category inventory_category,
  current_quantity BIGINT,
  daily_burn_rate DECIMAL(10,2),
  days_until_depleted INT,
  recommended_action TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH consumption AS (
    SELECT
      d.chapter_id,
      inv.category,
      SUM(di.quantity)::DECIMAL AS total_consumed,
      (SUM(di.quantity)::DECIMAL / GREATEST(p_lookback_days, 1))::DECIMAL(10,2) AS daily_rate
    FROM distributions d
    JOIN distribution_items di ON d.id = di.distribution_id
    JOIN inventory inv ON di.inventory_item_id = inv.id
    WHERE d.distributed_at >= NOW() - (p_lookback_days || ' days')::INTERVAL
    GROUP BY d.chapter_id, inv.category
  ),
  stock AS (
    SELECT
      inv.chapter_id,
      inv.category,
      SUM(inv.quantity)::BIGINT AS total_qty
    FROM inventory inv
    WHERE inv.is_active = true
    GROUP BY inv.chapter_id, inv.category
  )
  SELECT
    s.chapter_id,
    ch.name AS chapter_name,
    s.category,
    s.total_qty AS current_quantity,
    COALESCE(c.daily_rate, 0) AS daily_burn_rate,
    CASE
      WHEN COALESCE(c.daily_rate, 0) = 0 THEN 9999
      ELSE FLOOR(s.total_qty / c.daily_rate)::INT
    END AS days_until_depleted,
    CASE
      WHEN COALESCE(c.daily_rate, 0) = 0 THEN 'No recent consumption'
      WHEN FLOOR(s.total_qty / c.daily_rate) <= 3 THEN 'CRITICAL: Restock immediately'
      WHEN FLOOR(s.total_qty / c.daily_rate) <= 7 THEN 'WARNING: Order this week'
      WHEN FLOOR(s.total_qty / c.daily_rate) <= 14 THEN 'PLAN: Schedule restock'
      ELSE 'OK: Adequate supply'
    END AS recommended_action
  FROM stock s
  JOIN chapters ch ON s.chapter_id = ch.id
  LEFT JOIN consumption c ON s.chapter_id = c.chapter_id AND s.category = c.category
  ORDER BY days_until_depleted ASC;
END;
$$;

-- ============================================================
-- 3. DASHBOARD OVERVIEW STATS
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats(
  p_chapter_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_inventory_value', (
      SELECT COALESCE(SUM(fair_market_value * quantity), 0)
      FROM inventory
      WHERE is_active = true
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'total_distributions_30d', (
      SELECT COUNT(*)
      FROM distributions
      WHERE distributed_at >= NOW() - INTERVAL '30 days'
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'active_volunteers', (
      SELECT COUNT(*)
      FROM profiles
      WHERE role = 'volunteer' AND is_active = true
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'pending_requests', (
      SELECT COUNT(*)
      FROM help_requests
      WHERE status = 'pending'
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'low_stock_items', (
      SELECT COUNT(*)
      FROM inventory
      WHERE quantity < 10 AND is_active = true
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'total_cash_donations_30d', (
      SELECT COALESCE(SUM(amount), 0)
      FROM cash_donations
      WHERE created_at >= NOW() - INTERVAL '30 days'
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'chapters_active', (
      SELECT COUNT(*)
      FROM chapters
      WHERE is_active = true
        AND (p_chapter_id IS NULL OR id = p_chapter_id)
    ),
    'families_served_30d', (
      SELECT COUNT(DISTINCT recipient_id)
      FROM distributions
      WHERE distributed_at >= NOW() - INTERVAL '30 days'
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'high_urgency_requests', (
      SELECT COUNT(*)
      FROM help_requests
      WHERE urgency_score >= 80 AND status = 'pending'
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- 4. MONTHLY IMPACT SUMMARY
-- Used by the AI "Impact Story" generator
-- ============================================================

CREATE OR REPLACE FUNCTION get_monthly_impact(
  p_year INT,
  p_month INT,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date DATE;
  end_date DATE;
  result JSON;
BEGIN
  start_date := make_date(p_year, p_month, 1);
  end_date := (start_date + INTERVAL '1 month')::DATE;

  SELECT json_build_object(
    'period', json_build_object('year', p_year, 'month', p_month),
    'distributions', (
      SELECT json_build_object(
        'total_count', COUNT(*),
        'total_value', COALESCE(SUM(total_fair_market_value), 0),
        'unique_families', COUNT(DISTINCT recipient_id),
        'total_items', (
          SELECT COALESCE(SUM(di.quantity), 0)
          FROM distribution_items di
          JOIN distributions dd ON di.distribution_id = dd.id
          WHERE dd.distributed_at >= start_date AND dd.distributed_at < end_date
            AND (p_chapter_id IS NULL OR dd.chapter_id = p_chapter_id)
        )
      )
      FROM distributions
      WHERE distributed_at >= start_date AND distributed_at < end_date
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'volunteers', (
      SELECT json_build_object(
        'active_count', COUNT(DISTINCT volunteer_id),
        'total_hours', COALESCE(SUM(hours_logged), 0)
      )
      FROM volunteer_shifts
      WHERE checked_in_at >= start_date AND checked_in_at < end_date
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'donations', (
      SELECT json_build_object(
        'cash_total', COALESCE(SUM(amount), 0),
        'donation_count', COUNT(*)
      )
      FROM cash_donations
      WHERE created_at >= start_date AND created_at < end_date
        AND (p_chapter_id IS NULL OR chapter_id = p_chapter_id)
    ),
    'top_categories', (
      SELECT COALESCE(json_agg(cat_data), '[]')
      FROM (
        SELECT json_build_object(
          'category', inv.category,
          'quantity', SUM(di.quantity),
          'value', SUM(di.fair_market_value * di.quantity)
        ) AS cat_data
        FROM distribution_items di
        JOIN distributions d ON di.distribution_id = d.id
        JOIN inventory inv ON di.inventory_item_id = inv.id
        WHERE d.distributed_at >= start_date AND d.distributed_at < end_date
          AND (p_chapter_id IS NULL OR d.chapter_id = p_chapter_id)
        GROUP BY inv.category
        ORDER BY SUM(di.fair_market_value * di.quantity) DESC
        LIMIT 5
      ) sub
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- 5. ANOMALY DETECTION HELPER
-- Flags procurement that doesn't match typical patterns
-- ============================================================

CREATE OR REPLACE FUNCTION detect_procurement_anomalies()
RETURNS TABLE (
  procurement_id UUID,
  chapter_name TEXT,
  vendor TEXT,
  total_cost DECIMAL(10,2),
  anomaly_reason TEXT,
  confidence FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH chapter_avg AS (
    SELECT
      p.chapter_id,
      AVG(p.total_cost) AS avg_cost,
      STDDEV(p.total_cost) AS std_cost
    FROM procurement p
    WHERE p.created_at >= NOW() - INTERVAL '90 days'
      AND p.status != 'flagged'
    GROUP BY p.chapter_id
  )
  SELECT
    p.id AS procurement_id,
    ch.name AS chapter_name,
    p.vendor,
    p.total_cost,
    CASE
      WHEN p.total_cost > ca.avg_cost + (3 * COALESCE(ca.std_cost, 0))
        THEN 'Amount is 3+ standard deviations above average for this chapter'
      WHEN p.total_cost > 500 AND NOT EXISTS (
        SELECT 1 FROM help_requests hr
        WHERE hr.chapter_id = p.chapter_id
          AND hr.status IN ('pending', 'assigned', 'in_progress')
      )
        THEN 'Large order with no active help requests in chapter'
      ELSE 'Unusual spending pattern detected'
    END AS anomaly_reason,
    CASE
      WHEN p.total_cost > ca.avg_cost + (3 * COALESCE(ca.std_cost, 0)) THEN 0.85
      ELSE 0.6
    END::FLOAT AS confidence
  FROM procurement p
  JOIN chapters ch ON p.chapter_id = ch.id
  LEFT JOIN chapter_avg ca ON p.chapter_id = ca.chapter_id
  WHERE p.ai_flagged = false
    AND p.created_at >= NOW() - INTERVAL '7 days'
    AND (
      p.total_cost > COALESCE(ca.avg_cost + (3 * ca.std_cost), 500)
      OR (
        p.total_cost > 500
        AND NOT EXISTS (
          SELECT 1 FROM help_requests hr
          WHERE hr.chapter_id = p.chapter_id
            AND hr.status IN ('pending', 'assigned', 'in_progress')
        )
      )
    );
END;
$$;
