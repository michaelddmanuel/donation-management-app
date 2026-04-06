# DonationHub — Architecture & Master Plan

## The "Best Donation Management App Ever" Blueprint

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTS                                   │
├──────────────────────┬──────────────────────────────────────┤
│   📱 Mobile App      │   💻 Web Dashboard                   │
│   Expo + NativeWind  │   Next.js 14 + Shadcn + Tailwind    │
│   (Volunteer/Field)  │   (Admin/Super Admin)                │
├──────────────────────┴──────────────────────────────────────┤
│                    API LAYER                                 │
├─────────────────────────────────────────────────────────────┤
│   Supabase (Auth, Realtime, Storage, Edge Functions)        │
│   PostgREST auto-generated API + RLS policies               │
├─────────────────────────────────────────────────────────────┤
│                    AI LAYER                                   │
├────────────┬────────────┬───────────┬───────────────────────┤
│ Smart      │ Priority   │ Receipt   │ Impact                │
│ Intake     │ Dispatcher │ Parser    │ Report Gen            │
│ (Vision)   │ (NLP)      │ (OCR)     │ (Narrative)           │
├────────────┴────────────┴───────────┴───────────────────────┤
│                    DATABASE                                   │
├─────────────────────────────────────────────────────────────┤
│   PostgreSQL + PostGIS + pgvector                            │
│   ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────┐  │
│   │Inventory│ │Help Reqs │ │Distributions│ │AI Audit Logs │  │
│   │Chapters │ │Arrivals  │ │Procurement  │ │Burn Rates    │  │
│   │Profiles │ │Shifts    │ │Cash Ledger  │ │Market Prices │  │
│   └─────────┘ └──────────┘ └───────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
donation-management/
├── apps/
│   ├── web/                          # Next.js 14 Dashboard
│   │   └── src/
│   │       ├── app/
│   │       │   ├── dashboard/
│   │       │   │   ├── page.tsx           # Main dashboard (stats, alerts)
│   │       │   │   ├── inventory/         # Inventory table + CRUD
│   │       │   │   ├── arrivals/          # New arrivals management
│   │       │   │   ├── requests/          # Help requests queue
│   │       │   │   ├── distributions/     # Distribution tracking
│   │       │   │   ├── volunteers/        # Volunteer management
│   │       │   │   ├── finance/           # Cash donations + procurement
│   │       │   │   ├── analytics/         # Charts, burn rates, FMV
│   │       │   │   ├── ai/               # AI insights hub
│   │       │   │   │   ├── routes/        # Route optimization map
│   │       │   │   │   ├── fraud/         # Fraud detection alerts
│   │       │   │   │   └── reports/       # Impact report generator
│   │       │   │   └── settings/          # App + chapter settings
│   │       │   └── layout.tsx
│   │       ├── components/
│   │       │   ├── ui/                    # Shadcn components
│   │       │   └── layout/               # Sidebar, TopBar
│   │       └── lib/
│   │           ├── supabase/              # Client + Server clients
│   │           └── utils.ts
│   │
│   └── mobile/                       # Expo React Native App
│       ├── app/
│       │   ├── index.tsx                  # Home screen
│       │   ├── new-arrival.tsx            # Registration form
│       │   ├── scan-donation.tsx          # AI camera intake
│       │   ├── deliveries.tsx             # Optimized route view
│       │   └── requests.tsx               # Help request list
│       └── lib/
│           └── supabase.ts
│
├── packages/
│   ├── supabase/
│   │   ├── migrations/
│   │   │   ├── 001_foundation.sql         # Core schema
│   │   │   ├── 002_rls_policies.sql       # Row Level Security
│   │   │   └── 003_analytics_functions.sql # SQL analytics
│   │   └── functions/
│   │       ├── smart-intake/              # Vision AI
│   │       ├── priority-dispatcher/       # NLP urgency scoring
│   │       ├── receipt-parser/            # Receipt → Inventory
│   │       └── impact-report/             # Monthly narrative gen
│   │
│   └── shared/
│       └── types/                         # Shared TypeScript types
│
├── package.json                      # Monorepo root
└── turbo.json                        # Turborepo config
```

---

## 🔐 Security Architecture (RLS)

The RLS policies enforce a strict data isolation model:

| Role           | Scope                  | Can See              | Can Modify           |
|----------------|------------------------|----------------------|----------------------|
| `super_admin`  | All chapters           | Everything           | Everything           |
| `chapter_admin`| Own chapter only       | Own chapter data     | Own chapter data     |
| `volunteer`    | Own chapter            | Inventory, arrivals  | Register arrivals    |
| `requester`    | Own data only          | Own requests         | Create requests      |

**Example: California Admin sees ONLY California data** — enforced at the database level, not in application code.

---

## 🧠 AI Features — Implementation Priority

### Phase 1: Immediate (Ship This Month)
1. **Priority Dispatcher** — NLP urgency scoring on help requests
   - Low complexity, highest impact on operations
   - Cron: runs every 15 minutes via Supabase pg_cron

2. **Receipt-to-Inventory Parser** — Amazon/Walmart order auto-import
   - Eliminates hours of manual data entry daily
   - Trigger: email webhook or manual upload

### Phase 2: Next Sprint
3. **Smart Intake Engine** — Photo → SKU + FMV + condition
   - Requires mobile camera integration
   - Volunteers photograph items, AI does the rest

4. **Burn Rate Forecasting** — Predictive stock alerts
   - Pure SQL + cached daily, no LLM needed
   - Dashboard banner: "Texas out of formula in 4 days"

### Phase 3: Growth
5. **Route Optimizer** — PostGIS + Google Maps API
6. **Impact Story Generator** — Monthly donor reports
7. **Multilingual Intake** — Real-time translation
8. **Fraud/Anomaly Detection** — Spending pattern analysis

---

## 🎨 Design System — Untitled UI Inspired

### Principles
- **Clean, not cluttered** — Generous whitespace, 1-2 font weights
- **Data-dense without feeling heavy** — Tables with breathing room
- **Status through color, not noise** — Badges, not blinking alerts
- **Mobile-first** — Cards that stack beautifully

### Color Palette
- Primary: `#7C3AED` (Purple — trust, nonprofit feel)
- Success: `#10B981` (Green — good stock, verified)
- Warning: `#F59E0B` (Amber — attention needed)
- Destructive: `#EF4444` (Red — critical/low stock)
- Neutrals: Gray scale from `#F9FAFB` to `#101828`

### Typography
- Font: **Inter** (Untitled UI default)
- Display: Bold, tight tracking
- Body: Regular/Medium, relaxed line height
- Monospace: SKU codes, IDs

---

## 🚀 What Would Make This TRULY Elite

### 1. Real-time Operations Center
Instead of a static dashboard, build a **live ops view**:
- Supabase Realtime subscriptions on `help_requests`, `distributions`, `inventory`
- Live counter animations when items are distributed
- Map view with volunteer positions (opt-in GPS)
- Auto-refresh every 30s with smooth transitions

### 2. The "Command Console" for Super Admin
A single search bar (like Spotlight/Alfred) that can:
- "Show me Texas inventory below 10 units" → instant filtered table
- "Transfer 50 blankets from OK to TX" → generates transfer record
- "What did we spend on Amazon this month?" → instant chart
- Powered by Gemini function calling

### 3. WhatsApp / SMS Bot for Requesters
Many new arrivals don't have smartphones or can't navigate apps.
- **Twilio + Supabase Edge Function**
- Requester texts: "I need diapers for my baby"
- Bot auto-creates help request, scores urgency, responds in their language
- "We received your request. A volunteer will contact you within 24 hours."

### 4. QR Code Care Packages
Each care package gets a unique QR code:
- Volunteer scans it → marks as distributed
- Recipient scans it → sees contents in their language
- Admin scans it → sees full chain of custody
- Eliminates paper-based tracking entirely

### 5. Donor Portal (Separate App)
A public-facing site where donors can:
- See real-time impact metrics
- "Adopt a care package" — sponsor a specific package
- Receive AI-generated thank-you with de-identified recipient story
- Tax receipt auto-generation with FMV values

### 6. Automated Compliance
- **IRS Form 8283** auto-generation for donations > $500
- In-kind donation receipts with FMV calculations
- Audit trail for every item from intake → distribution
- Annual report generation for board meetings

### 7. Offline-First Mobile
- SQLite + Supabase sync for field operations
- Volunteers in areas with poor connectivity can still:
  - Register arrivals
  - Mark distributions
  - Take photos
- Syncs automatically when back online

### 8. Gamification for Volunteers
- Leaderboard: "Top 10 volunteers this month"
- Badges: "First 100 distributions", "Night owl" (after-hours shifts)
- Hours tracker with exportable volunteer log
- Social sharing: "I helped 12 families this week with @DonationHub"

---

## 🔧 Setup Instructions

### 1. Supabase Project
```bash
# Create a project at supabase.com
# Run migrations in order:
psql $DATABASE_URL < packages/supabase/migrations/001_foundation.sql
psql $DATABASE_URL < packages/supabase/migrations/002_rls_policies.sql
psql $DATABASE_URL < packages/supabase/migrations/003_analytics_functions.sql

# Deploy edge functions:
supabase functions deploy smart-intake
supabase functions deploy priority-dispatcher
supabase functions deploy receipt-parser
supabase functions deploy impact-report
```

### 2. Web Dashboard
```bash
cd apps/web
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

### 3. Mobile App
```bash
cd apps/mobile
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npm install
npx expo start
```

---

## 📊 Key Database Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `calculate_fmv_last_30_days()` | FMV totals by category | On-demand / dashboard |
| `calculate_burn_rates()` | Days until depletion per chapter | Daily cron |
| `get_dashboard_stats()` | Aggregate stats JSON | Dashboard load |
| `get_monthly_impact()` | Monthly data for report gen | Monthly cron |
| `detect_procurement_anomalies()` | Flag suspicious spending | Daily cron |

---

## 🔮 Tech Stack Decision Log

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | Next.js 14 (App Router) | SSR, RSC, best DX |
| Mobile | Expo + NativeWind | Cross-platform with Tailwind |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage + Realtime |
| AI | Google Gemini 1.5 Pro | Best multimodal, generous free tier |
| Geospatial | PostGIS | Industry standard, free |
| Styling | Tailwind + Shadcn | Consistent, accessible, fast |
| Monorepo | Turborepo | Fast builds, shared types |
| Maps | React-Leaflet (web) / MapView (mobile) | Free, no API key needed for basic |
