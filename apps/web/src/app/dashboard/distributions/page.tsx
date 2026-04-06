"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Package,
  QrCode,
  Truck,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Plus,
  Copy,
  ChevronDown,
  MapPin,
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

interface Distribution {
  id: string;
  care_package_name: string;
  recipient_name: string;
  chapter: string;
  state_code: string;
  status: "pending" | "in_transit" | "delivered" | "failed";
  qr_code: string;
  qr_status: "generated" | "assigned" | "distributed" | "void";
  items_count: number;
  total_fmv: number;
  volunteer: string;
  scheduled_at: string;
  delivered_at: string | null;
}

const mockDistributions: Distribution[] = [
  { id: "1", care_package_name: "Welcome Kit", recipient_name: "Maria Elena Garcia", chapter: "Texas", state_code: "TX", status: "pending", qr_code: "QR-TX-WK-001", qr_status: "assigned", items_count: 12, total_fmv: 245.00, volunteer: "James Wilson", scheduled_at: "2026-04-06T10:00:00Z", delivered_at: null },
  { id: "2", care_package_name: "Winter Bundle", recipient_name: "Olena Bondarenko", chapter: "Illinois", state_code: "IL", status: "in_transit", qr_code: "QR-IL-WB-014", qr_status: "assigned", items_count: 8, total_fmv: 189.50, volunteer: "Mike Rodriguez", scheduled_at: "2026-04-05T14:00:00Z", delivered_at: null },
  { id: "3", care_package_name: "Baby Essentials", recipient_name: "Fatima Al-Said", chapter: "California", state_code: "CA", status: "delivered", qr_code: "QR-CA-BE-022", qr_status: "distributed", items_count: 15, total_fmv: 312.00, volunteer: "Sarah Chen", scheduled_at: "2026-04-04T09:00:00Z", delivered_at: "2026-04-04T11:23:00Z" },
  { id: "4", care_package_name: "Welcome Kit", recipient_name: "Jean-Pierre Toussaint", chapter: "Florida", state_code: "FL", status: "delivered", qr_code: "QR-FL-WK-007", qr_status: "distributed", items_count: 12, total_fmv: 245.00, volunteer: "Ana Morales", scheduled_at: "2026-04-03T11:00:00Z", delivered_at: "2026-04-03T13:15:00Z" },
  { id: "5", care_package_name: "School Supplies", recipient_name: "Carlos Alberto Mendez", chapter: "Texas", state_code: "TX", status: "pending", qr_code: "QR-TX-SS-003", qr_status: "generated", items_count: 10, total_fmv: 87.50, volunteer: "Unassigned", scheduled_at: "2026-04-07T09:00:00Z", delivered_at: null },
  { id: "6", care_package_name: "Hygiene Pack", recipient_name: "Ahmad Fazli Razavi", chapter: "California", state_code: "CA", status: "delivered", qr_code: "QR-CA-HP-019", qr_status: "distributed", items_count: 9, total_fmv: 64.00, volunteer: "Sarah Chen", scheduled_at: "2026-04-02T15:00:00Z", delivered_at: "2026-04-02T16:40:00Z" },
  { id: "7", care_package_name: "Welcome Kit", recipient_name: "Nadia Ahmadi", chapter: "California", state_code: "CA", status: "failed", qr_code: "QR-CA-WK-021", qr_status: "void", items_count: 12, total_fmv: 245.00, volunteer: "Tom Baker", scheduled_at: "2026-04-04T10:00:00Z", delivered_at: null },
];

function statusBadge(status: string) {
  switch (status) {
    case "pending": return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    case "in_transit": return <Badge className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200"><Truck className="h-3 w-3" />In Transit</Badge>;
    case "delivered": return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Delivered</Badge>;
    case "failed": return <Badge variant="error" className="gap-1">Failed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

function qrBadge(status: string, code: string) {
  const colors: Record<string, string> = {
    generated: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    assigned: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    distributed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    void: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <div className="flex items-center gap-2">
      <QrCode className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="font-mono text-xs">{code}</p>
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${colors[status] || ""}`}>{status}</span>
      </div>
    </div>
  );
}

export default function DistributionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");

  const filtered = useMemo(() => {
    let data = [...mockDistributions];
    if (statusFilter !== "all") data = data.filter((d) => d.status === statusFilter);
    if (chapterFilter !== "all") data = data.filter((d) => d.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) =>
        d.recipient_name.toLowerCase().includes(q) ||
        d.care_package_name.toLowerCase().includes(q) ||
        d.qr_code.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, statusFilter, chapterFilter]);

  const deliveredCount = mockDistributions.filter((d) => d.status === "delivered").length;
  const totalFmv = mockDistributions.filter((d) => d.status === "delivered").reduce((s, d) => s + d.total_fmv, 0);
  const pendingCount = mockDistributions.filter((d) => d.status === "pending" || d.status === "in_transit").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">Distributions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Care package tracking with QR verification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <QrCode className="h-4 w-4" />Generate QR Batch
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />New Distribution
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{deliveredCount}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalFmv.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Total FMV Distributed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <QrCode className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockDistributions.length}</p>
              <p className="text-xs text-muted-foreground">QR Codes Issued</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by recipient, package, or QR code..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chapterFilter} onValueChange={setChapterFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chapters</SelectItem>
                <SelectItem value="California">California</SelectItem>
                <SelectItem value="Texas">Texas</SelectItem>
                <SelectItem value="Florida">Florida</SelectItem>
                <SelectItem value="Illinois">Illinois</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>QR Code</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Chapter</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>FMV</TableHead>
              <TableHead>Volunteer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No distributions found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{qrBadge(d.qr_status, d.qr_code)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{d.care_package_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{d.recipient_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-[9px] font-bold text-primary">{d.state_code}</span>
                      <span className="text-sm">{d.chapter}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{d.items_count}</TableCell>
                  <TableCell className="text-sm font-medium">${d.total_fmv.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.volunteer}</TableCell>
                  <TableCell>{statusBadge(d.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {d.status === "pending" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Start delivery">
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
