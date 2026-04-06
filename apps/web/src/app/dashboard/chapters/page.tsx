"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  BarChart3,
  Heart,
  Truck,
  Clock,
  Eye,
  Edit,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Chapter {
  id: string;
  name: string;
  state_code: string;
  region: string;
  status: "active" | "onboarding" | "inactive";
  admin_name: string;
  admin_email: string;
  admin_phone: string;
  address: string;
  founded: string;
  volunteers: number;
  active_volunteers: number;
  families_served: number;
  families_served_trend: number;
  inventory_value: number;
  inventory_trend: number;
  donations_mtd: number;
  donations_trend: number;
  distributions_mtd: number;
  pending_requests: number;
  avg_fulfillment_hours: number;
}

const mockChapters: Chapter[] = [
  { id: "1", name: "Texas", state_code: "TX", region: "South", status: "active", admin_name: "Sarah Chen", admin_email: "sarah@donationhub.org", admin_phone: "(512) 555-0100", address: "1200 Congress Ave, Austin, TX 78701", founded: "2024-03-15", volunteers: 24, active_volunteers: 18, families_served: 342, families_served_trend: 12, inventory_value: 18500, inventory_trend: 8, donations_mtd: 4200, donations_trend: 15, distributions_mtd: 89, pending_requests: 12, avg_fulfillment_hours: 18 },
  { id: "2", name: "California", state_code: "CA", region: "West", status: "active", admin_name: "Priya Patel", admin_email: "priya@donationhub.org", admin_phone: "(415) 555-0200", address: "500 Market St, San Francisco, CA 94105", founded: "2024-01-10", volunteers: 31, active_volunteers: 22, families_served: 289, families_served_trend: 8, inventory_value: 22100, inventory_trend: -3, donations_mtd: 5800, donations_trend: 22, distributions_mtd: 76, pending_requests: 8, avg_fulfillment_hours: 14 },
  { id: "3", name: "New York", state_code: "NY", region: "Northeast", status: "active", admin_name: "Marcus Johnson", admin_email: "marcus@donationhub.org", admin_phone: "(212) 555-0300", address: "350 5th Ave, New York, NY 10118", founded: "2024-02-20", volunteers: 28, active_volunteers: 20, families_served: 234, families_served_trend: 6, inventory_value: 15800, inventory_trend: 5, donations_mtd: 6100, donations_trend: 18, distributions_mtd: 62, pending_requests: 15, avg_fulfillment_hours: 22 },
  { id: "4", name: "Florida", state_code: "FL", region: "South", status: "active", admin_name: "Ana Morales", admin_email: "ana@donationhub.org", admin_phone: "(305) 555-0400", address: "401 Biscayne Blvd, Miami, FL 33132", founded: "2024-06-01", volunteers: 19, active_volunteers: 14, families_served: 198, families_served_trend: 20, inventory_value: 11200, inventory_trend: 12, donations_mtd: 2900, donations_trend: -5, distributions_mtd: 51, pending_requests: 9, avg_fulfillment_hours: 16 },
  { id: "5", name: "Illinois", state_code: "IL", region: "Midwest", status: "active", admin_name: "David Kim", admin_email: "david@donationhub.org", admin_phone: "(312) 555-0500", address: "233 S Wacker Dr, Chicago, IL 60606", founded: "2024-07-15", volunteers: 16, active_volunteers: 11, families_served: 167, families_served_trend: 10, inventory_value: 9800, inventory_trend: -1, donations_mtd: 2100, donations_trend: 7, distributions_mtd: 43, pending_requests: 6, avg_fulfillment_hours: 20 },
  { id: "6", name: "Ohio", state_code: "OH", region: "Midwest", status: "active", admin_name: "Tom Baker", admin_email: "tom@donationhub.org", admin_phone: "(614) 555-0600", address: "1 Nationwide Blvd, Columbus, OH 43215", founded: "2024-09-01", volunteers: 12, active_volunteers: 8, families_served: 123, families_served_trend: 15, inventory_value: 7400, inventory_trend: 10, donations_mtd: 1500, donations_trend: 3, distributions_mtd: 31, pending_requests: 4, avg_fulfillment_hours: 24 },
  { id: "7", name: "Oklahoma", state_code: "OK", region: "South", status: "active", admin_name: "Lisa Chen", admin_email: "lisa@donationhub.org", admin_phone: "(405) 555-0700", address: "100 E Reno Ave, Oklahoma City, OK 73104", founded: "2025-01-10", volunteers: 9, active_volunteers: 7, families_served: 98, families_served_trend: 25, inventory_value: 5600, inventory_trend: 18, donations_mtd: 980, donations_trend: 30, distributions_mtd: 24, pending_requests: 3, avg_fulfillment_hours: 12 },
  { id: "8", name: "Georgia", state_code: "GA", region: "South", status: "active", admin_name: "James Wilson", admin_email: "james@donationhub.org", admin_phone: "(404) 555-0800", address: "55 Trinity Ave SW, Atlanta, GA 30303", founded: "2025-02-01", volunteers: 10, active_volunteers: 6, families_served: 87, families_served_trend: 35, inventory_value: 4900, inventory_trend: 22, donations_mtd: 850, donations_trend: 45, distributions_mtd: 19, pending_requests: 5, avg_fulfillment_hours: 15 },
  { id: "9", name: "Washington", state_code: "WA", region: "West", status: "onboarding", admin_name: "Emily Park", admin_email: "emily@donationhub.org", admin_phone: "(206) 555-0900", address: "600 4th Ave, Seattle, WA 98104", founded: "2026-03-01", volunteers: 3, active_volunteers: 2, families_served: 12, families_served_trend: 0, inventory_value: 1200, inventory_trend: 0, donations_mtd: 350, donations_trend: 0, distributions_mtd: 4, pending_requests: 2, avg_fulfillment_hours: 30 },
  { id: "10", name: "Arizona", state_code: "AZ", region: "West", status: "onboarding", admin_name: "Carlos Rivera", admin_email: "carlos@donationhub.org", admin_phone: "(602) 555-1000", address: "200 W Washington St, Phoenix, AZ 85003", founded: "2026-03-15", volunteers: 2, active_volunteers: 1, families_served: 5, families_served_trend: 0, inventory_value: 800, inventory_trend: 0, donations_mtd: 200, donations_trend: 0, distributions_mtd: 2, pending_requests: 1, avg_fulfillment_hours: 48 },
];

/* ── Mini chart components ── */

function MiniBar({ data, height = 100 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-1 px-1" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-0.5 flex-1">
          <span className="text-[9px] font-medium text-foreground">{d.value}</span>
          <div
            className="w-full rounded-t bg-primary/80 min-h-[2px] transition-all"
            style={{ height: `${(d.value / max) * (height - 30)}px` }}
          />
          <span className="text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return <Badge variant="secondary" className="text-[10px]">New</Badge>;
  return value > 0 ? (
    <Badge variant="success" className="text-[10px] gap-0.5"><ArrowUpRight className="h-3 w-3" />+{value}%</Badge>
  ) : (
    <Badge variant="warning" className="text-[10px] gap-0.5"><ArrowDownRight className="h-3 w-3" />{value}%</Badge>
  );
}

function StatusBadge({ status }: { status: Chapter["status"] }) {
  switch (status) {
    case "active": return <Badge variant="success">Active</Badge>;
    case "onboarding": return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200">Onboarding</Badge>;
    case "inactive": return <Badge variant="secondary">Inactive</Badge>;
  }
}

/* ── Detail view mock data generators ── */

function getChapterMonthlyData(chapter: Chapter) {
  const base = chapter.distributions_mtd;
  return [
    { label: "Nov", value: Math.round(base * 0.65) },
    { label: "Dec", value: Math.round(base * 0.9) },
    { label: "Jan", value: Math.round(base * 0.75) },
    { label: "Feb", value: Math.round(base * 0.85) },
    { label: "Mar", value: Math.round(base * 1.1) },
    { label: "Apr", value: base },
  ];
}

function getChapterDonationData(chapter: Chapter) {
  const base = chapter.donations_mtd;
  return [
    { label: "Nov", value: Math.round(base * 0.5) },
    { label: "Dec", value: Math.round(base * 1.1) },
    { label: "Jan", value: Math.round(base * 0.7) },
    { label: "Feb", value: Math.round(base * 0.8) },
    { label: "Mar", value: Math.round(base * 0.95) },
    { label: "Apr", value: base },
  ];
}

const topItems = [
  { name: "Diapers (size 3-5)", qty: 145, category: "Baby" },
  { name: "Rice 25lb bags", qty: 32, category: "Food" },
  { name: "Winter Coats (M/L)", qty: 48, category: "Clothing" },
  { name: "Hygiene Kits", qty: 67, category: "Hygiene" },
  { name: "Blankets", qty: 54, category: "Home" },
];

export default function ChaptersPage() {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = (() => {
    let data = [...mockChapters];
    if (statusFilter !== "all") data = data.filter((c) => c.status === statusFilter);
    if (regionFilter !== "all") data = data.filter((c) => c.region === regionFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((c) => c.name.toLowerCase().includes(q) || c.admin_name.toLowerCase().includes(q) || c.state_code.toLowerCase().includes(q));
    }
    return data;
  })();

  const totals = {
    chapters: mockChapters.filter((c) => c.status === "active").length,
    volunteers: mockChapters.reduce((s, c) => s + c.active_volunteers, 0),
    families: mockChapters.reduce((s, c) => s + c.families_served, 0),
    inventory: mockChapters.reduce((s, c) => s + c.inventory_value, 0),
  };

  /* ── Chapter Detail View ── */
  if (selectedChapter) {
    const ch = selectedChapter;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedChapter(null)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white text-sm font-bold">{ch.state_code}</div>
              <div>
                <h1 className="text-display-xs font-bold text-foreground">{ch.name} Chapter</h1>
                <p className="text-sm text-muted-foreground">{ch.address}</p>
              </div>
              <StatusBadge status={ch.status} />
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Edit className="h-4 w-4" />Edit Chapter</Button>
        </div>

        {/* Admin info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Chapter Admin:</span>
                <span className="font-medium">{ch.admin_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{ch.admin_email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{ch.admin_phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Founded:</span>
                <span className="font-medium">{ch.founded}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{ch.families_served}</p>
              <p className="text-xs text-muted-foreground">Families Served</p>
              <TrendBadge value={ch.families_served_trend} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{ch.active_volunteers}<span className="text-sm text-muted-foreground font-normal">/{ch.volunteers}</span></p>
              <p className="text-xs text-muted-foreground">Active Volunteers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">${ch.inventory_value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Inventory FMV</p>
              <TrendBadge value={ch.inventory_trend} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">${ch.donations_mtd.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Donations MTD</p>
              <TrendBadge value={ch.donations_trend} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold">{ch.distributions_mtd}</p>
              <p className="text-xs text-muted-foreground">Distributions MTD</p>
            </CardContent>
          </Card>
          <Card className={ch.pending_requests > 10 ? "border-amber-300" : ""}>
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{ch.pending_requests}</p>
              <p className="text-xs text-muted-foreground">Pending Requests</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Avg {ch.avg_fulfillment_hours}h to fulfill</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Monthly Distributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniBar data={getChapterMonthlyData(ch)} height={160} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Monthly Donations ($)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniBar data={getChapterDonationData(ch)} height={160} />
            </CardContent>
          </Card>
        </div>

        {/* Top Inventory & Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Top Inventory Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <Badge variant="secondary">{item.qty} units</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Chapter Scorecard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Request Fulfillment Rate", value: 87, color: "bg-emerald-500" },
                  { label: "Volunteer Retention (6mo)", value: 72, color: "bg-blue-500" },
                  { label: "Donor Satisfaction", value: 94, color: "bg-primary" },
                  { label: "Inventory Turnover", value: 65, color: "bg-amber-500" },
                  { label: "Community Reach", value: 58, color: "bg-purple-500" },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <span className="text-sm font-medium">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ── Chapter List View ── */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-muted-foreground" />
            Chapters
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totals.chapters} active chapters · {totals.volunteers} volunteers · {totals.families.toLocaleString()} families served
          </p>
        </div>
        <Button size="sm" className="gap-2"><Building2 className="h-4 w-4" />Add Chapter</Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mockChapters.length}</p>
              <p className="text-xs text-muted-foreground">Total Chapters</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totals.volunteers}</p>
              <p className="text-xs text-muted-foreground">Active Volunteers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <Heart className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totals.families.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Families Served</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Package className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totals.inventory.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Inventory FMV</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search chapters, admins..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="West">West</SelectItem>
                <SelectItem value="Northeast">Northeast</SelectItem>
                <SelectItem value="Midwest">Midwest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chapters Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Chapter</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Volunteers</TableHead>
              <TableHead className="text-center">Families</TableHead>
              <TableHead className="text-right">Inventory FMV</TableHead>
              <TableHead className="text-right">Donations MTD</TableHead>
              <TableHead className="text-center">Distributions</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No chapters found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((ch) => (
                <TableRow key={ch.id} className="cursor-pointer" onClick={() => setSelectedChapter(ch)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">{ch.state_code}</div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{ch.name}</p>
                        <p className="text-xs text-muted-foreground">{ch.region}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{ch.admin_name}</p>
                    <p className="text-xs text-muted-foreground">{ch.admin_email}</p>
                  </TableCell>
                  <TableCell><StatusBadge status={ch.status} /></TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">{ch.active_volunteers}</span>
                    <span className="text-muted-foreground text-xs">/{ch.volunteers}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium">{ch.families_served}</span>
                      <TrendBadge value={ch.families_served_trend} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">${ch.inventory_value.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-medium">${ch.donations_mtd.toLocaleString()}</span>
                      <TrendBadge value={ch.donations_trend} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{ch.distributions_mtd}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View chapter details" onClick={(e) => { e.stopPropagation(); setSelectedChapter(ch); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
