"use client";

import { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Eye,
  Users,
  Timer,
  Star,
  ClipboardCheck,
  MapPin,
  Calendar,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Route,
  Truck,
  AlertCircle,
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

type VolunteerStatus = "active" | "on_shift" | "inactive";
type ApplicationStatus = "applied" | "screening" | "interview" | "approved" | "rejected";
type AssignmentStatus = "assigned" | "in_progress" | "completed" | "cancelled";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  chapter: string;
  state_code: string;
  role: "volunteer" | "chapter_admin";
  status: VolunteerStatus;
  total_hours: number;
  shifts_this_month: number;
  current_shift_start: string | null;
  specialties: string[];
  joined_at: string;
}

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  chapter: string;
  state_code: string;
  applied_at: string;
  status: ApplicationStatus;
  motivation: string;
  experience: string;
  availability: string;
  background_check: "pending" | "passed" | "failed" | "not_started";
  references: number;
  preferred_roles: string[];
  languages: string[];
}

interface Assignment {
  id: string;
  volunteer_name: string;
  volunteer_id: string;
  chapter: string;
  state_code: string;
  type: "delivery_route" | "warehouse_shift" | "registration_desk" | "sorting" | "special_event";
  description: string;
  date: string;
  time_slot: string;
  status: AssignmentStatus;
  location: string;
}

/* ── Mock Data ── */

const mockVolunteers: Volunteer[] = [
  { id: "1", name: "James Wilson", email: "james@example.com", phone: "(512) 555-0143", chapter: "Texas", state_code: "TX", role: "volunteer", status: "on_shift", total_hours: 248, shifts_this_month: 12, current_shift_start: "2026-04-05T08:00:00Z", specialties: ["Registration", "Deliveries"], joined_at: "2025-03-15" },
  { id: "2", name: "Sarah Chen", email: "sarah@example.com", phone: "(415) 555-0187", chapter: "California", state_code: "CA", role: "chapter_admin", status: "active", total_hours: 512, shifts_this_month: 18, current_shift_start: null, specialties: ["Admin", "Intake", "Training"], joined_at: "2024-11-01" },
  { id: "3", name: "Mike Rodriguez", email: "mike@example.com", phone: "(312) 555-0221", chapter: "Illinois", state_code: "IL", role: "volunteer", status: "on_shift", total_hours: 189, shifts_this_month: 9, current_shift_start: "2026-04-05T09:30:00Z", specialties: ["Deliveries", "Sorting"], joined_at: "2025-06-10" },
  { id: "4", name: "Ana Morales", email: "ana@example.com", phone: "(305) 555-0312", chapter: "Florida", state_code: "FL", role: "volunteer", status: "active", total_hours: 342, shifts_this_month: 14, current_shift_start: null, specialties: ["Translation", "Registration"], joined_at: "2025-01-20" },
  { id: "5", name: "Tom Baker", email: "tom@example.com", phone: "(614) 555-0098", chapter: "Ohio", state_code: "OH", role: "volunteer", status: "inactive", total_hours: 67, shifts_this_month: 0, current_shift_start: null, specialties: ["Sorting"], joined_at: "2025-09-01" },
  { id: "6", name: "Priya Patel", email: "priya@example.com", phone: "(646) 555-0445", chapter: "New York", state_code: "NY", role: "chapter_admin", status: "active", total_hours: 430, shifts_this_month: 16, current_shift_start: null, specialties: ["Admin", "Finance", "Procurement"], joined_at: "2024-08-15" },
  { id: "7", name: "David Kim", email: "david@example.com", phone: "(405) 555-0567", chapter: "Oklahoma", state_code: "OK", role: "volunteer", status: "on_shift", total_hours: 156, shifts_this_month: 8, current_shift_start: "2026-04-05T07:00:00Z", specialties: ["Deliveries", "Warehouse"], joined_at: "2025-07-22" },
  { id: "8", name: "Lisa Johnson", email: "lisa@example.com", phone: "(404) 555-0678", chapter: "Georgia", state_code: "GA", role: "volunteer", status: "active", total_hours: 95, shifts_this_month: 5, current_shift_start: null, specialties: ["Registration", "Translation"], joined_at: "2025-10-05" },
];

const mockApplications: Application[] = [
  { id: "a1", name: "Rachel Green", email: "rachel.g@example.com", phone: "(512) 555-1001", chapter: "Texas", state_code: "TX", applied_at: "2026-04-04", status: "applied", motivation: "Want to help refugee families settle into their new community. I have experience from church volunteering.", experience: "2 years church food pantry", availability: "Weekends, some weekday evenings", background_check: "not_started", references: 2, preferred_roles: ["Registration", "Deliveries"], languages: ["English", "Spanish"] },
  { id: "a2", name: "Kevin Park", email: "kevin.p@example.com", phone: "(415) 555-1002", chapter: "California", state_code: "CA", applied_at: "2026-04-03", status: "screening", motivation: "I'm a retired social worker and want to continue helping vulnerable populations.", experience: "15 years social work, retired", availability: "Weekdays 9am-3pm", background_check: "pending", references: 3, preferred_roles: ["Intake", "Translation"], languages: ["English", "Korean"] },
  { id: "a3", name: "Maria Santos", email: "maria.s@example.com", phone: "(305) 555-1003", chapter: "Florida", state_code: "FL", applied_at: "2026-04-02", status: "interview", motivation: "As a former refugee myself, I want to give back and help others navigate the system.", experience: "Community interpreter, 3 years", availability: "Flexible schedule", background_check: "passed", references: 2, preferred_roles: ["Translation", "Registration"], languages: ["English", "Spanish", "Portuguese"] },
  { id: "a4", name: "Chris Thompson", email: "chris.t@example.com", phone: "(312) 555-1004", chapter: "Illinois", state_code: "IL", applied_at: "2026-04-01", status: "approved", motivation: "College student looking for meaningful volunteer work and to gain experience.", experience: "Student, no prior volunteering", availability: "Tuesdays and Thursdays after 2pm", background_check: "passed", references: 1, preferred_roles: ["Sorting", "Warehouse"], languages: ["English"] },
  { id: "a5", name: "Fatima Al-Hassan", email: "fatima.a@example.com", phone: "(646) 555-1005", chapter: "New York", state_code: "NY", applied_at: "2026-03-30", status: "screening", motivation: "I speak Arabic and want to help Arabic-speaking families with translation and intake.", experience: "Medical interpreter, 5 years", availability: "Mon-Wed-Fri mornings", background_check: "pending", references: 2, preferred_roles: ["Translation", "Intake"], languages: ["English", "Arabic", "French"] },
  { id: "a6", name: "Jake Morrison", email: "jake.m@example.com", phone: "(614) 555-1006", chapter: "Ohio", state_code: "OH", applied_at: "2026-03-28", status: "rejected", motivation: "Need volunteer hours for school credit.", experience: "None", availability: "Minimum required only", background_check: "failed", references: 0, preferred_roles: ["Sorting"], languages: ["English"] },
  { id: "a7", name: "Amira Osei", email: "amira.o@example.com", phone: "(404) 555-1007", chapter: "Georgia", state_code: "GA", applied_at: "2026-04-05", status: "applied", motivation: "Recently moved to Atlanta and want to connect with my community through service.", experience: "Habitat for Humanity, 1 year", availability: "Saturdays all day", background_check: "not_started", references: 1, preferred_roles: ["Deliveries", "Registration"], languages: ["English", "Twi"] },
];

const mockAssignments: Assignment[] = [
  { id: "s1", volunteer_name: "James Wilson", volunteer_id: "1", chapter: "Texas", state_code: "TX", type: "delivery_route", description: "North Austin delivery route — 8 families", date: "2026-04-05", time_slot: "8:00 AM - 12:00 PM", status: "in_progress", location: "North Austin, TX" },
  { id: "s2", volunteer_name: "Mike Rodriguez", volunteer_id: "3", chapter: "Illinois", state_code: "IL", type: "warehouse_shift", description: "Warehouse sorting and inventory count", date: "2026-04-05", time_slot: "9:30 AM - 1:30 PM", status: "in_progress", location: "Chicago Warehouse, IL" },
  { id: "s3", volunteer_name: "David Kim", volunteer_id: "7", chapter: "Oklahoma", state_code: "OK", type: "delivery_route", description: "South OKC delivery route — 5 families", date: "2026-04-05", time_slot: "7:00 AM - 11:00 AM", status: "in_progress", location: "South Oklahoma City, OK" },
  { id: "s4", volunteer_name: "Ana Morales", volunteer_id: "4", chapter: "Florida", state_code: "FL", type: "registration_desk", description: "New arrival registration at Miami center", date: "2026-04-06", time_slot: "9:00 AM - 1:00 PM", status: "assigned", location: "Miami Welcome Center, FL" },
  { id: "s5", volunteer_name: "Lisa Johnson", volunteer_id: "8", chapter: "Georgia", state_code: "GA", type: "registration_desk", description: "Walk-in registration desk", date: "2026-04-06", time_slot: "10:00 AM - 2:00 PM", status: "assigned", location: "Atlanta Center, GA" },
  { id: "s6", volunteer_name: "Sarah Chen", volunteer_id: "2", chapter: "California", state_code: "CA", type: "special_event", description: "Spring donation drive coordination", date: "2026-04-07", time_slot: "8:00 AM - 4:00 PM", status: "assigned", location: "SF Convention Center, CA" },
  { id: "s7", volunteer_name: "James Wilson", volunteer_id: "1", chapter: "Texas", state_code: "TX", type: "sorting", description: "Clothing donation sorting", date: "2026-04-03", time_slot: "2:00 PM - 6:00 PM", status: "completed", location: "Austin Warehouse, TX" },
  { id: "s8", volunteer_name: "Priya Patel", volunteer_id: "6", chapter: "New York", state_code: "NY", type: "warehouse_shift", description: "Inventory restock and organization", date: "2026-04-04", time_slot: "10:00 AM - 3:00 PM", status: "completed", location: "NYC Warehouse, NY" },
];

/* ── Tab types ── */
type Tab = "roster" | "applications" | "assignments";

/* ── Badge helpers ── */

function statusBadge(status: VolunteerStatus) {
  switch (status) {
    case "on_shift": return <Badge className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"><Timer className="h-3 w-3" />On Shift</Badge>;
    case "active": return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>;
    case "inactive": return <Badge variant="secondary" className="gap-1">Inactive</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

function applicationStatusBadge(status: ApplicationStatus) {
  switch (status) {
    case "applied": return <Badge className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"><AlertCircle className="h-3 w-3" />New</Badge>;
    case "screening": return <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200"><Shield className="h-3 w-3" />Screening</Badge>;
    case "interview": return <Badge className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200"><Users className="h-3 w-3" />Interview</Badge>;
    case "approved": return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
    case "rejected": return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
  }
}

function bgCheckBadge(status: Application["background_check"]) {
  switch (status) {
    case "passed": return <Badge variant="success" className="text-[10px]">Passed</Badge>;
    case "pending": return <Badge variant="warning" className="text-[10px]">Pending</Badge>;
    case "failed": return <Badge variant="destructive" className="text-[10px]">Failed</Badge>;
    case "not_started": return <Badge variant="secondary" className="text-[10px]">Not Started</Badge>;
  }
}

function assignmentTypeBadge(type: Assignment["type"]) {
  switch (type) {
    case "delivery_route": return <Badge className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"><Truck className="h-3 w-3" />Delivery</Badge>;
    case "warehouse_shift": return <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200"><ClipboardCheck className="h-3 w-3" />Warehouse</Badge>;
    case "registration_desk": return <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200"><UserPlus className="h-3 w-3" />Registration</Badge>;
    case "sorting": return <Badge className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200">Sorting</Badge>;
    case "special_event": return <Badge className="gap-1 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200"><Star className="h-3 w-3" />Event</Badge>;
  }
}

function assignmentStatusBadge(status: AssignmentStatus) {
  switch (status) {
    case "assigned": return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Scheduled</Badge>;
    case "in_progress": return <Badge className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"><Timer className="h-3 w-3" />In Progress</Badge>;
    case "completed": return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
    case "cancelled": return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>;
  }
}

export default function VolunteersPage() {
  const [tab, setTab] = useState<Tab>("roster");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [applications, setApplications] = useState(mockApplications);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  /* ── Roster filters ── */
  const filteredVolunteers = useMemo(() => {
    let data = [...mockVolunteers];
    if (statusFilter !== "all") data = data.filter((v) => v.status === statusFilter);
    if (chapterFilter !== "all") data = data.filter((v) => v.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((v) =>
        v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q) ||
        v.chapter.toLowerCase().includes(q) || v.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }
    return data;
  }, [search, statusFilter, chapterFilter]);

  /* ── Application filters ── */
  const filteredApplications = useMemo(() => {
    let data = [...applications];
    if (statusFilter !== "all") data = data.filter((a) => a.status === statusFilter);
    if (chapterFilter !== "all") data = data.filter((a) => a.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.chapter.toLowerCase().includes(q));
    }
    return data;
  }, [search, statusFilter, chapterFilter, applications]);

  /* ── Assignment filters ── */
  const filteredAssignments = useMemo(() => {
    let data = [...mockAssignments];
    if (statusFilter !== "all") data = data.filter((a) => a.status === statusFilter);
    if (chapterFilter !== "all") data = data.filter((a) => a.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((a) => a.volunteer_name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));
    }
    return data;
  }, [search, statusFilter, chapterFilter]);

  /* ── Application actions ── */
  function updateAppStatus(id: string, newStatus: ApplicationStatus) {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
  }

  const onShiftCount = mockVolunteers.filter((v) => v.status === "on_shift").length;
  const totalHoursMonth = mockVolunteers.reduce((s, v) => s + v.shifts_this_month, 0);
  const pendingApps = applications.filter((a) => a.status === "applied" || a.status === "screening" || a.status === "interview").length;
  const activeAssignments = mockAssignments.filter((a) => a.status === "in_progress" || a.status === "assigned").length;

  /* ── Reset filters on tab change ── */
  function switchTab(t: Tab) {
    setTab(t);
    setStatusFilter("all");
    setSearch("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">Volunteers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockVolunteers.length} volunteers · {onShiftCount} on shift · {pendingApps} pending applications
          </p>
        </div>
        <Button size="sm" className="gap-2"><UserPlus className="h-4 w-4" />Add Volunteer</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{onShiftCount}</p>
              <p className="text-xs text-muted-foreground">On Shift Now</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockVolunteers.filter((v) => v.status !== "inactive").length}</p>
              <p className="text-xs text-muted-foreground">Active Volunteers</p>
            </div>
          </CardContent>
        </Card>
        <Card className={pendingApps > 0 ? "border-amber-300/50" : ""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingApps}</p>
              <p className="text-xs text-muted-foreground">Pending Applications</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeAssignments}</p>
              <p className="text-xs text-muted-foreground">Active Assignments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {([
          { key: "roster" as Tab, label: "Active Roster", count: mockVolunteers.length },
          { key: "applications" as Tab, label: "Applications", count: pendingApps },
          { key: "assignments" as Tab, label: "Assignments", count: activeAssignments },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
              tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
            {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === key ? "bg-primary/10 text-primary" : "bg-muted-foreground/10"}`}>{count}</span>}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={tab === "roster" ? "Search by name, email, or specialty..." : tab === "applications" ? "Search applicants..." : "Search assignments..."}
                value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {tab === "roster" && (
                  <>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="on_shift">On Shift</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </>
                )}
                {tab === "applications" && (
                  <>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="applied">New</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </>
                )}
                {tab === "assignments" && (
                  <>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="assigned">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
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

      {/* ─── ROSTER TAB ─── */}
      {tab === "roster" && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Volunteer</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>This Month</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVolunteers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No volunteers found.</TableCell></TableRow>
              ) : (
                filteredVolunteers.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {v.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{v.name}</p>
                          <p className="text-xs text-muted-foreground">{v.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-[9px] font-bold text-primary">{v.state_code}</span>
                        <span className="text-sm">{v.chapter}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.role === "chapter_admin" ? "default" : "secondary"} className="text-xs">
                        {v.role === "chapter_admin" ? "Admin" : "Volunteer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {v.specialties.map((s) => (
                          <span key={s} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{v.total_hours}h</TableCell>
                    <TableCell className="text-sm">{v.shifts_this_month} shifts</TableCell>
                    <TableCell>{statusBadge(v.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View profile"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Contact"><Phone className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── APPLICATIONS TAB ─── */}
      {tab === "applications" && (
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No applications found.</CardContent></Card>
          ) : (
            filteredApplications.map((app) => (
              <Card key={app.id} className={app.status === "applied" ? "border-blue-300/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Applicant info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                        {app.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-foreground">{app.name}</p>
                          {applicationStatusBadge(app.status)}
                          <span className="text-xs text-muted-foreground">Applied {app.applied_at}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{app.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.phone}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{app.chapter}, {app.state_code}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {app.preferred_roles.map((r) => (
                            <span key={r} className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{r}</span>
                          ))}
                          {app.languages.map((l) => (
                            <span key={l} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Meta & actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">BG Check:</span>
                        {bgCheckBadge(app.background_check)}
                      </div>
                      <div className="text-xs text-muted-foreground">{app.references} reference{app.references !== 1 ? "s" : ""}</div>
                      <div className="flex gap-2 mt-1">
                        {app.status !== "approved" && app.status !== "rejected" && (
                          <>
                            <Button size="sm" variant="outline" className="gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => updateAppStatus(app.id, "approved")}>
                              <ThumbsUp className="h-3 w-3" />Approve
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1 text-red-600 border-red-300 hover:bg-red-50" onClick={() => updateAppStatus(app.id, "rejected")}>
                              <ThumbsDown className="h-3 w-3" />Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                          <Eye className="h-3 w-3 mr-1" />{expandedApp === app.id ? "Less" : "More"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedApp === app.id && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Motivation</p>
                        <p className="text-sm">{app.motivation}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Experience</p>
                          <p className="text-sm">{app.experience}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Availability</p>
                          <p className="text-sm">{app.availability}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Preferred Roles</p>
                          <p className="text-sm">{app.preferred_roles.join(", ")}</p>
                        </div>
                      </div>
                      {app.status !== "approved" && app.status !== "rejected" && (
                        <div className="flex gap-2 pt-2">
                          <span className="text-xs text-muted-foreground">Move to:</span>
                          {app.status !== "screening" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateAppStatus(app.id, "screening")}>Screening</Button>}
                          {app.status !== "interview" && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateAppStatus(app.id, "interview")}>Interview</Button>}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ─── ASSIGNMENTS TAB ─── */}
      {tab === "assignments" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Volunteer Assignments</CardTitle>
              <Button size="sm" className="gap-2"><Route className="h-4 w-4" />New Assignment</Button>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Volunteer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No assignments found.</TableCell></TableRow>
              ) : (
                filteredAssignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {a.volunteer_name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{a.volunteer_name}</p>
                          <p className="text-xs text-muted-foreground">{a.chapter}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{assignmentTypeBadge(a.type)}</TableCell>
                    <TableCell><p className="text-sm">{a.description}</p></TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{a.date}</p>
                      <p className="text-xs text-muted-foreground">{a.time_slot}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        {a.location}
                      </div>
                    </TableCell>
                    <TableCell>{assignmentStatusBadge(a.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View details"><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
