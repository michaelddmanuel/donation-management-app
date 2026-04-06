"use client";

import { useState, useMemo } from "react";
import {
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Eye,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Package,
  Gift,
  FileText,
  Calendar,
  BarChart3,
  Heart,
  Users,
  Building2,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ── Types ── */

type TxType = "cash_donation" | "procurement" | "reimbursement";
type DonationMethod = "online" | "check" | "cash" | "wire" | "recurring";
type InKindCondition = "new" | "like_new" | "good" | "fair";

interface FinancialTx {
  id: string;
  type: TxType;
  description: string;
  amount: number;
  chapter: string;
  state_code: string;
  category: string;
  donor_name: string | null;
  vendor: string | null;
  receipt_url: string | null;
  ai_fraud_flag: boolean;
  fraud_reason: string | null;
  date: string;
}

interface IncomingDonation {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_type: "individual" | "corporate" | "foundation" | "anonymous";
  amount: number;
  method: DonationMethod;
  chapter: string;
  state_code: string;
  category: string;
  designation: "unrestricted" | "restricted" | "endowment";
  recurring: boolean;
  tax_receipt_sent: boolean;
  thank_you_sent: boolean;
  date: string;
  note: string | null;
}

interface InKindDonation {
  id: string;
  donor_name: string;
  chapter: string;
  state_code: string;
  items: { name: string; quantity: number; category: string; condition: InKindCondition; estimated_fmv: number }[];
  total_fmv: number;
  tax_receipt_sent: boolean;
  date: string;
  pickup_required: boolean;
  notes: string | null;
}

/* ── Mock Data ── */

const mockTransactions: FinancialTx[] = [
  { id: "1", type: "cash_donation", description: "Monthly recurring donation", amount: 500.00, chapter: "Texas", state_code: "TX", category: "Unrestricted", donor_name: "John & Mary Smith", vendor: null, receipt_url: null, ai_fraud_flag: false, fraud_reason: null, date: "2026-04-05" },
  { id: "2", type: "procurement", description: "Bulk diapers purchase — Costco", amount: -847.32, chapter: "California", state_code: "CA", category: "Baby Supplies", donor_name: null, vendor: "Costco Wholesale", receipt_url: "/receipts/r002.pdf", ai_fraud_flag: false, fraud_reason: null, date: "2026-04-04" },
  { id: "3", type: "cash_donation", description: "Corporate match — Spring Drive", amount: 2500.00, chapter: "New York", state_code: "NY", category: "Corporate", donor_name: "Acme Corp Foundation", vendor: null, receipt_url: null, ai_fraud_flag: false, fraud_reason: null, date: "2026-04-04" },
  { id: "4", type: "procurement", description: "Winter coats — Burlington", amount: -1234.00, chapter: "Illinois", state_code: "IL", category: "Clothing", donor_name: null, vendor: "Burlington Store #412", receipt_url: "/receipts/r004.pdf", ai_fraud_flag: true, fraud_reason: "Amount 3.2σ above category average for this chapter. Review recommended.", date: "2026-04-03" },
  { id: "5", type: "cash_donation", description: "Online donation via portal", amount: 150.00, chapter: "Florida", state_code: "FL", category: "Unrestricted", donor_name: "Anonymous", vendor: null, receipt_url: null, ai_fraud_flag: false, fraud_reason: null, date: "2026-04-03" },
  { id: "6", type: "procurement", description: "Rice, beans, oil — Restaurant Depot", amount: -523.88, chapter: "Texas", state_code: "TX", category: "Food", donor_name: null, vendor: "Restaurant Depot", receipt_url: "/receipts/r006.pdf", ai_fraud_flag: false, fraud_reason: null, date: "2026-04-02" },
  { id: "7", type: "reimbursement", description: "Volunteer fuel reimbursement — deliveries", amount: -78.50, chapter: "Ohio", state_code: "OH", category: "Operations", donor_name: null, vendor: null, receipt_url: "/receipts/r007.pdf", ai_fraud_flag: false, fraud_reason: null, date: "2026-04-02" },
  { id: "8", type: "cash_donation", description: "In-memory donation — Garcia family", amount: 1000.00, chapter: "Texas", state_code: "TX", category: "Restricted — Families", donor_name: "Elena Vasquez", vendor: null, receipt_url: null, ai_fraud_flag: false, fraud_reason: null, date: "2026-04-01" },
  { id: "9", type: "procurement", description: "Hygiene kits bulk — Amazon Business", amount: -412.67, chapter: "California", state_code: "CA", category: "Hygiene", donor_name: null, vendor: "Amazon Business", receipt_url: "/receipts/r009.pdf", ai_fraud_flag: false, fraud_reason: null, date: "2026-04-01" },
  { id: "10", type: "procurement", description: "Electronics — Best Buy", amount: -2100.00, chapter: "Oklahoma", state_code: "OK", category: "Electronics", donor_name: null, vendor: "Best Buy #329", receipt_url: "/receipts/r010.pdf", ai_fraud_flag: true, fraud_reason: "Electronics category rarely used. First purchase over $500 in this category for OK chapter.", date: "2026-03-30" },
];

const mockCashDonations: IncomingDonation[] = [
  { id: "d1", donor_name: "John & Mary Smith", donor_email: "smithfamily@example.com", donor_type: "individual", amount: 500, method: "recurring", chapter: "Texas", state_code: "TX", category: "General", designation: "unrestricted", recurring: true, tax_receipt_sent: true, thank_you_sent: true, date: "2026-04-05", note: "Monthly recurring since Jan 2025" },
  { id: "d2", donor_name: "Acme Corp Foundation", donor_email: "giving@acmecorp.com", donor_type: "corporate", amount: 2500, method: "wire", chapter: "New York", state_code: "NY", category: "Spring Drive Match", designation: "restricted", recurring: false, tax_receipt_sent: true, thank_you_sent: true, date: "2026-04-04", note: "Corporate match for Spring Drive campaign" },
  { id: "d3", donor_name: "Anonymous", donor_email: "", donor_type: "anonymous", amount: 150, method: "online", chapter: "Florida", state_code: "FL", category: "General", designation: "unrestricted", recurring: false, tax_receipt_sent: false, thank_you_sent: false, date: "2026-04-03", note: null },
  { id: "d4", donor_name: "Elena Vasquez", donor_email: "elena.v@example.com", donor_type: "individual", amount: 1000, method: "check", chapter: "Texas", state_code: "TX", category: "Family Support", designation: "restricted", recurring: false, tax_receipt_sent: true, thank_you_sent: true, date: "2026-04-01", note: "In memory of Garcia family" },
  { id: "d5", donor_name: "Grace Community Church", donor_email: "office@gracechurch.org", donor_type: "foundation", amount: 3500, method: "check", chapter: "California", state_code: "CA", category: "Food Program", designation: "restricted", recurring: false, tax_receipt_sent: true, thank_you_sent: true, date: "2026-03-30", note: "Easter offering designated for food program" },
  { id: "d6", donor_name: "Robert Kim", donor_email: "rkim@example.com", donor_type: "individual", amount: 75, method: "online", chapter: "Georgia", state_code: "GA", category: "General", designation: "unrestricted", recurring: true, tax_receipt_sent: true, thank_you_sent: true, date: "2026-03-28", note: null },
  { id: "d7", donor_name: "United Fund of Oklahoma", donor_email: "grants@unitedfund.org", donor_type: "foundation", amount: 5000, method: "wire", chapter: "Oklahoma", state_code: "OK", category: "Operations", designation: "restricted", recurring: false, tax_receipt_sent: true, thank_you_sent: true, date: "2026-03-25", note: "Grant for warehouse operations" },
  { id: "d8", donor_name: "Lisa Park", donor_email: "lisa.park@example.com", donor_type: "individual", amount: 250, method: "cash", chapter: "Illinois", state_code: "IL", category: "General", designation: "unrestricted", recurring: false, tax_receipt_sent: false, thank_you_sent: false, date: "2026-04-02", note: "Walk-in cash donation" },
];

const mockInKindDonations: InKindDonation[] = [
  { id: "k1", donor_name: "Target Store #1245", chapter: "Texas", state_code: "TX", items: [
    { name: "Baby Diapers (Size 3)", quantity: 200, category: "Baby", condition: "new", estimated_fmv: 1200 },
    { name: "Baby Wipes", quantity: 100, category: "Baby", condition: "new", estimated_fmv: 400 },
    { name: "Baby Formula", quantity: 48, category: "Baby", condition: "new", estimated_fmv: 960 },
  ], total_fmv: 2560, tax_receipt_sent: true, date: "2026-04-04", pickup_required: false, notes: "Quarterly donation from local Target" },
  { id: "k2", donor_name: "Johnson Family", chapter: "California", state_code: "CA", items: [
    { name: "Winter Coats (Adult M/L)", quantity: 12, category: "Clothing", condition: "like_new", estimated_fmv: 480 },
    { name: "Children's Shoes", quantity: 8, category: "Clothing", condition: "good", estimated_fmv: 160 },
    { name: "Blankets", quantity: 6, category: "Home", condition: "new", estimated_fmv: 180 },
  ], total_fmv: 820, tax_receipt_sent: true, date: "2026-04-03", pickup_required: true, notes: "Family downsizing, very generous donation" },
  { id: "k3", donor_name: "Costco Wholesale", chapter: "New York", state_code: "NY", items: [
    { name: "Rice (25lb bags)", quantity: 50, category: "Food", condition: "new", estimated_fmv: 1250 },
    { name: "Canned Vegetables (cases)", quantity: 30, category: "Food", condition: "new", estimated_fmv: 600 },
    { name: "Cooking Oil (gallon)", quantity: 24, category: "Food", condition: "new", estimated_fmv: 240 },
  ], total_fmv: 2090, tax_receipt_sent: true, date: "2026-04-02", pickup_required: false, notes: null },
  { id: "k4", donor_name: "IKEA Donation Program", chapter: "Illinois", state_code: "IL", items: [
    { name: "Bedding Sets (Twin)", quantity: 15, category: "Home", condition: "new", estimated_fmv: 600 },
    { name: "Kitchen Starter Kits", quantity: 10, category: "Home", condition: "new", estimated_fmv: 500 },
    { name: "Bath Towel Sets", quantity: 20, category: "Home", condition: "new", estimated_fmv: 300 },
  ], total_fmv: 1400, tax_receipt_sent: true, date: "2026-04-01", pickup_required: false, notes: "Partnership donation — monthly recurring" },
  { id: "k5", donor_name: "Community Clothing Drive", chapter: "Florida", state_code: "FL", items: [
    { name: "Assorted Clothing (Adult)", quantity: 150, category: "Clothing", condition: "good", estimated_fmv: 1500 },
    { name: "Assorted Clothing (Children)", quantity: 80, category: "Clothing", condition: "good", estimated_fmv: 640 },
    { name: "Shoes (Assorted)", quantity: 45, category: "Clothing", condition: "fair", estimated_fmv: 450 },
  ], total_fmv: 2590, tax_receipt_sent: false, date: "2026-03-29", pickup_required: false, notes: "Spring clothing drive — needs sorting" },
];

/* ── Tab type ── */
type Tab = "transactions" | "cash_donations" | "inkind" | "reports";

/* ── Badge helpers ── */

function typeBadge(type: TxType) {
  switch (type) {
    case "cash_donation": return <Badge variant="success" className="gap-1"><ArrowUpRight className="h-3 w-3" />Donation</Badge>;
    case "procurement": return <Badge variant="warning" className="gap-1"><ArrowDownRight className="h-3 w-3" />Procurement</Badge>;
    case "reimbursement": return <Badge variant="secondary" className="gap-1">Reimbursement</Badge>;
  }
}

function donorTypeBadge(type: IncomingDonation["donor_type"]) {
  switch (type) {
    case "individual": return <Badge variant="secondary" className="text-[10px]"><Users className="h-3 w-3 mr-0.5" />Individual</Badge>;
    case "corporate": return <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-200"><Building2 className="h-3 w-3 mr-0.5" />Corporate</Badge>;
    case "foundation": return <Badge className="text-[10px] bg-purple-100 text-purple-700 border-purple-200"><Heart className="h-3 w-3 mr-0.5" />Foundation</Badge>;
    case "anonymous": return <Badge variant="secondary" className="text-[10px]">Anonymous</Badge>;
  }
}

function methodBadge(method: DonationMethod) {
  const styles: Record<DonationMethod, string> = {
    online: "bg-emerald-100 text-emerald-700 border-emerald-200",
    check: "bg-blue-100 text-blue-700 border-blue-200",
    cash: "bg-amber-100 text-amber-700 border-amber-200",
    wire: "bg-purple-100 text-purple-700 border-purple-200",
    recurring: "bg-primary/10 text-primary border-primary/20",
  };
  return <Badge className={`text-[10px] ${styles[method]}`}>{method.charAt(0).toUpperCase() + method.slice(1)}</Badge>;
}

function conditionBadge(condition: InKindCondition) {
  switch (condition) {
    case "new": return <Badge variant="success" className="text-[10px]">New</Badge>;
    case "like_new": return <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-200">Like New</Badge>;
    case "good": return <Badge variant="secondary" className="text-[10px]">Good</Badge>;
    case "fair": return <Badge variant="warning" className="text-[10px]">Fair</Badge>;
  }
}

/* ── Mini chart ── */

function MiniBar({ data, height = 140 }: { data: { label: string; value: number; color?: string }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 px-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] font-medium text-foreground">${d.value.toLocaleString()}</span>
          <div
            className={`w-full rounded-t min-h-[4px] transition-all ${d.color || "bg-primary/80"}`}
            style={{ height: `${(d.value / max) * (height - 40)}px` }}
          />
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>("transactions");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [expandedInKind, setExpandedInKind] = useState<string | null>(null);

  /* ── Transaction filters ── */
  const filteredTx = useMemo(() => {
    let data = [...mockTransactions];
    if (typeFilter !== "all") data = data.filter((t) => t.type === typeFilter);
    if (chapterFilter !== "all") data = data.filter((t) => t.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((t) =>
        t.description.toLowerCase().includes(q) || (t.donor_name && t.donor_name.toLowerCase().includes(q)) ||
        (t.vendor && t.vendor.toLowerCase().includes(q)) || t.category.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, typeFilter, chapterFilter]);

  /* ── Cash donation filters ── */
  const filteredCash = useMemo(() => {
    let data = [...mockCashDonations];
    if (typeFilter !== "all") data = data.filter((d) => d.donor_type === typeFilter);
    if (chapterFilter !== "all") data = data.filter((d) => d.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.donor_name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    return data;
  }, [search, typeFilter, chapterFilter]);

  /* ── In-kind filters ── */
  const filteredInKind = useMemo(() => {
    let data = [...mockInKindDonations];
    if (chapterFilter !== "all") data = data.filter((d) => d.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) => d.donor_name.toLowerCase().includes(q) || d.items.some((i) => i.name.toLowerCase().includes(q)));
    }
    return data;
  }, [search, chapterFilter]);

  const totalDonations = mockTransactions.filter((t) => t.type === "cash_donation").reduce((s, t) => s + t.amount, 0);
  const totalSpending = mockTransactions.filter((t) => t.type !== "cash_donation").reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalInKindFMV = mockInKindDonations.reduce((s, d) => s + d.total_fmv, 0);
  const fraudFlags = mockTransactions.filter((t) => t.ai_fraud_flag).length;

  function switchTab(t: Tab) {
    setTab(t);
    setTypeFilter("all");
    setSearch("");
  }

  /* ── Report data ── */
  const monthlyDonations = [
    { label: "Nov", value: 8200 },
    { label: "Dec", value: 14500 },
    { label: "Jan", value: 9800 },
    { label: "Feb", value: 11200 },
    { label: "Mar", value: 12800 },
    { label: "Apr", value: totalDonations },
  ];

  const byChapter = [
    { label: "TX", value: 1500 },
    { label: "CA", value: 5800 },
    { label: "NY", value: 6100 },
    { label: "FL", value: 150 },
    { label: "IL", value: 250 },
    { label: "OK", value: 5000 },
    { label: "GA", value: 75 },
  ];

  const byCategory = [
    { category: "Unrestricted", amount: 975, pct: 23 },
    { category: "Corporate Match", amount: 2500, pct: 19 },
    { category: "Food Program", amount: 3500, pct: 27 },
    { category: "Family Support", amount: 1000, pct: 8 },
    { category: "Operations", amount: 5000, pct: 15 },
    { category: "Other", amount: 1000, pct: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">Finance & Donations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track cash donations, in-kind gifts, procurement, and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Export</Button>
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Record Transaction</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalDonations.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Cash Donations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-500/10">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalInKindFMV.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">In-Kind FMV</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <TrendingDown className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalSpending.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Spending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${(totalDonations + totalInKindFMV - totalSpending).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Net Position</p>
            </div>
          </CardContent>
        </Card>
        <Card className={fraudFlags > 0 ? "border-destructive/50" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${fraudFlags > 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-emerald-50 dark:bg-emerald-500/10"}`}>
              <ShieldAlert className={`h-5 w-5 ${fraudFlags > 0 ? "text-red-600" : "text-emerald-600"}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{fraudFlags}</p>
              <p className="text-xs text-muted-foreground">AI Fraud Flags</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alert */}
      {fraudFlags > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">AI Anomaly Detection — {fraudFlags} flagged transactions</p>
              <p className="text-xs text-muted-foreground mt-1">
                The AI has flagged transactions that deviate significantly from historical spending patterns.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {([
          { key: "transactions" as Tab, label: "All Transactions", icon: CreditCard },
          { key: "cash_donations" as Tab, label: "Cash Donations", icon: DollarSign },
          { key: "inkind" as Tab, label: "In-Kind Donations", icon: Gift },
          { key: "reports" as Tab, label: "Reports", icon: FileText },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters (all tabs except reports) */}
      {tab !== "reports" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions, donors, vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              {tab === "transactions" && (
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cash_donation">Donations</SelectItem>
                    <SelectItem value="procurement">Procurement</SelectItem>
                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {tab === "cash_donations" && (
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Donors</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="anonymous">Anonymous</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={chapterFilter} onValueChange={setChapterFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="Illinois">Illinois</SelectItem>
                  <SelectItem value="Ohio">Ohio</SelectItem>
                  <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── TRANSACTIONS TAB ─── */}
      {tab === "transactions" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Flag</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTx.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
              ) : (
                filteredTx.map((tx) => (
                  <TableRow key={tx.id} className={tx.ai_fraud_flag ? "bg-destructive/5" : ""}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{tx.date}</TableCell>
                    <TableCell>{typeBadge(tx.type)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description}</p>
                        {tx.donor_name && <p className="text-xs text-muted-foreground">From: {tx.donor_name}</p>}
                        {tx.vendor && <p className="text-xs text-muted-foreground">Vendor: {tx.vendor}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-[9px] font-bold text-primary">{tx.state_code}</span>
                        <span className="text-sm">{tx.chapter}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{tx.category}</span></TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium text-sm ${tx.amount > 0 ? "text-emerald-600" : "text-foreground"}`}>
                        {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {tx.ai_fraud_flag ? (
                        <div className="group relative">
                          <ShieldAlert className="h-4 w-4 text-destructive" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-md border w-64 z-10">{tx.fraud_reason}</div>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" title="View details"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── CASH DONATIONS TAB ─── */}
      {tab === "cash_donations" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCash.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No donations found.</TableCell></TableRow>
              ) : (
                filteredCash.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{d.date}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{d.donor_name}</p>
                        {d.donor_email && <p className="text-xs text-muted-foreground">{d.donor_email}</p>}
                        {d.note && <p className="text-xs text-muted-foreground italic mt-0.5">{d.note}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{donorTypeBadge(d.donor_type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {methodBadge(d.method)}
                        {d.recurring && <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">Recurring</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-[9px] font-bold text-primary">{d.state_code}</span>
                        <span className="text-sm">{d.chapter}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.designation === "unrestricted" ? "secondary" : d.designation === "restricted" ? "warning" : "default"} className="text-[10px]">
                        {d.designation.charAt(0).toUpperCase() + d.designation.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-sm text-emerald-600">+${d.amount.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {d.tax_receipt_sent ? (
                          <Badge variant="success" className="text-[10px]">Sent</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">Pending</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" title="View details"><Eye className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── IN-KIND DONATIONS TAB ─── */}
      {tab === "inkind" && (
        <div className="space-y-4">
          {filteredInKind.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No in-kind donations found.</CardContent></Card>
          ) : (
            filteredInKind.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 shrink-0">
                        <Gift className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{d.donor_name}</p>
                          <span className="text-xs text-muted-foreground">{d.date}</span>
                          {d.pickup_required && <Badge variant="warning" className="text-[10px]">Pickup Required</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="flex items-center justify-center h-4 w-4 rounded bg-primary/10 text-[8px] font-bold text-primary">{d.state_code}</span>
                            {d.chapter}
                          </span>
                          <span>{d.items.length} item type{d.items.length !== 1 ? "s" : ""}</span>
                          <span>{d.items.reduce((s, i) => s + i.quantity, 0)} total units</span>
                        </div>
                        {d.notes && <p className="text-xs text-muted-foreground italic mt-1">{d.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-lg font-bold text-emerald-600">${d.total_fmv.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Estimated FMV</p>
                      <div className="flex gap-2">
                        {d.tax_receipt_sent ? (
                          <Badge variant="success" className="text-[10px]">Receipt Sent</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">Receipt Pending</Badge>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setExpandedInKind(expandedInKind === d.id ? null : d.id)}>
                          <Eye className="h-3 w-3 mr-1" />{expandedInKind === d.id ? "Less" : "Items"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded items list */}
                  {expandedInKind === d.id && (
                    <div className="mt-4 pt-4 border-t">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Item</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead>Condition</TableHead>
                            <TableHead className="text-right">Est. FMV</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {d.items.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-sm font-medium">{item.name}</TableCell>
                              <TableCell><span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{item.category}</span></TableCell>
                              <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                              <TableCell>{conditionBadge(item.condition)}</TableCell>
                              <TableCell className="text-right font-medium text-emerald-600">${item.estimated_fmv.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ─── REPORTS TAB ─── */}
      {tab === "reports" && (
        <div className="space-y-6">
          {/* Report header */}
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Donation Report — April 2026</p>
                  <p className="text-xs text-muted-foreground">All chapters · Cash + In-Kind</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Export PDF</Button>
                <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Export CSV</Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Raised (Cash)</p>
                <p className="text-2xl font-bold text-emerald-600">${mockCashDonations.reduce((s, d) => s + d.amount, 0).toLocaleString()}</p>
                <Badge variant="success" className="text-[10px] mt-1"><ArrowUpRight className="h-3 w-3" />+18% MoM</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total In-Kind FMV</p>
                <p className="text-2xl font-bold text-purple-600">${totalInKindFMV.toLocaleString()}</p>
                <Badge variant="success" className="text-[10px] mt-1"><ArrowUpRight className="h-3 w-3" />+24% MoM</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Unique Donors</p>
                <p className="text-2xl font-bold">{mockCashDonations.filter((d) => d.donor_type !== "anonymous").length + mockInKindDonations.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{mockCashDonations.filter((d) => d.recurring).length} recurring</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Avg. Gift Size</p>
                <p className="text-2xl font-bold">${Math.round(mockCashDonations.reduce((s, d) => s + d.amount, 0) / mockCashDonations.length).toLocaleString()}</p>
                <Badge variant="warning" className="text-[10px] mt-1"><ArrowDownRight className="h-3 w-3" />-5% MoM</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  Monthly Cash Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MiniBar data={monthlyDonations} height={160} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Donations by Chapter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MiniBar data={byChapter} height={160} />
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Donation Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {byCategory.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{cat.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">${cat.amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground w-8 text-right">{cat.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tax receipt status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tax Receipt Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Cash Receipts Sent</p>
                    <p className="text-xs text-muted-foreground">{mockCashDonations.filter((d) => d.tax_receipt_sent).length} of {mockCashDonations.length}</p>
                  </div>
                  <Badge variant="success">{Math.round((mockCashDonations.filter((d) => d.tax_receipt_sent).length / mockCashDonations.length) * 100)}%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">In-Kind Receipts Sent</p>
                    <p className="text-xs text-muted-foreground">{mockInKindDonations.filter((d) => d.tax_receipt_sent).length} of {mockInKindDonations.length}</p>
                  </div>
                  <Badge variant={mockInKindDonations.some((d) => !d.tax_receipt_sent) ? "warning" : "success"}>
                    {Math.round((mockInKindDonations.filter((d) => d.tax_receipt_sent).length / mockInKindDonations.length) * 100)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Thank You Notes</p>
                    <p className="text-xs text-muted-foreground">{mockCashDonations.filter((d) => d.thank_you_sent).length} of {mockCashDonations.length}</p>
                  </div>
                  <Badge variant={mockCashDonations.some((d) => !d.thank_you_sent) ? "warning" : "success"}>
                    {Math.round((mockCashDonations.filter((d) => d.thank_you_sent).length / mockCashDonations.length) * 100)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
