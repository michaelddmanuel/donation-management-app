// ============================================================
// Donation Management App — Shared Types
// ============================================================

// ---- Core Entities ----

export type UserRole = 'super_admin' | 'chapter_admin' | 'volunteer' | 'requester';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  chapter_id: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  name: string; // e.g. "California"
  state_code: string; // e.g. "CA"
  region: string;
  address: string | null;
  coordinator_id: string | null;
  geo_center: { lat: number; lng: number } | null;
  is_active: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  chapter_id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  fair_market_value: number;
  condition: ItemCondition;
  image_url: string | null;
  msrp: number | null;
  source_vendor: string | null;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  chapter?: Chapter;
}

export type InventoryCategory =
  | 'food'
  | 'clothing'
  | 'hygiene'
  | 'baby_supplies'
  | 'household'
  | 'medical'
  | 'electronics'
  | 'furniture'
  | 'school_supplies'
  | 'other';

export type ItemCondition = 'new' | 'good' | 'fair' | 'poor';

export interface NewArrival {
  id: string;
  full_name: string;
  id_number: string;
  photo_url: string;
  id_document_url: string | null;
  chapter_id: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  preferred_language: string;
  family_size: number;
  notes: string | null;
  registered_by: string; // volunteer profile id
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface HelpRequest {
  id: string;
  requester_id: string;
  chapter_id: string;
  description: string;
  category: InventoryCategory;
  urgency_score: number; // 0-100, AI-calculated
  status: 'pending' | 'assigned' | 'in_progress' | 'fulfilled' | 'cancelled';
  assigned_volunteer_id: string | null;
  preferred_language: string;
  original_text: string | null; // for multilingual
  translated_text: string | null;
  family_size: number;
  created_at: string;
  updated_at: string;
}

export interface CarePackage {
  id: string;
  name: string;
  chapter_id: string;
  template_items: CarePackageItem[];
  estimated_value: number;
  is_template: boolean;
  created_at: string;
}

export interface CarePackageItem {
  inventory_item_id: string;
  quantity: number;
  item_name?: string;
}

export interface Distribution {
  id: string;
  help_request_id: string;
  care_package_id: string | null;
  chapter_id: string;
  distributed_by: string; // volunteer id
  recipient_id: string;
  items: DistributionLineItem[];
  total_fair_market_value: number;
  signature_url: string | null;
  notes: string | null;
  distributed_at: string;
  created_at: string;
}

export interface DistributionLineItem {
  inventory_item_id: string;
  item_name: string;
  quantity: number;
  fair_market_value: number;
}

export interface Procurement {
  id: string;
  chapter_id: string;
  vendor: string;
  order_id_external: string | null;
  items: ProcurementLineItem[];
  total_cost: number;
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'flagged';
  receipt_url: string | null;
  ordered_by: string;
  approved_by: string | null;
  ai_flagged: boolean;
  ai_flag_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProcurementLineItem {
  item_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
}

export interface CashDonation {
  id: string;
  chapter_id: string;
  donor_name: string | null;
  amount: number;
  source: 'online' | 'cash' | 'check' | 'transfer';
  receipt_url: string | null;
  notes: string | null;
  received_by: string;
  created_at: string;
}

export interface VolunteerShift {
  id: string;
  volunteer_id: string;
  chapter_id: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  hours_logged: number;
  geo_checkin: { lat: number; lng: number } | null;
  geo_checkout: { lat: number; lng: number } | null;
  status: 'scheduled' | 'active' | 'completed' | 'no_show';
}

// ---- AI Entities ----

export interface AIFraudFlag {
  id: string;
  target_table: string;
  target_id: string;
  reasoning: string;
  confidence_score: number;
  is_resolved: boolean;
  resolved_by: string | null;
  created_at: string;
}

export interface MarketPrice {
  id: string;
  item_name: string;
  detected_price: number;
  source_vendor: string;
  last_scraped: string;
}

export interface AIRouteOptimization {
  id: string;
  branch_id: string;
  volunteer_id: string;
  optimized_path: unknown; // GeoJSON
  stops: RouteStop[];
  estimated_time_minutes: number;
  created_at: string;
}

export interface RouteStop {
  help_request_id: string;
  address: string;
  lat: number;
  lng: number;
  order: number;
}

// ---- Dashboard Stats ----

export interface DashboardStats {
  total_inventory_value: number;
  total_distributions_30d: number;
  active_volunteers: number;
  pending_requests: number;
  low_stock_items: number;
  total_cash_donations_30d: number;
  chapters_active: number;
  families_served_30d: number;
}

export interface BurnRateForecast {
  chapter_id: string;
  chapter_name: string;
  category: InventoryCategory;
  current_quantity: number;
  daily_burn_rate: number;
  days_until_depleted: number;
  recommended_action: string;
}
