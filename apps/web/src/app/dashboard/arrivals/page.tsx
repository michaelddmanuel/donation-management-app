"use client";

import { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Camera,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter,
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

interface Arrival {
  id: string;
  full_name: string;
  id_number: string;
  photo_url: string;
  chapter: string;
  state_code: string;
  status: "pending_verification" | "verified" | "rejected";
  preferred_language: string;
  family_size: number;
  registered_by: string;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
}

const mockArrivals: Arrival[] = [
  { id: "1", full_name: "Maria Elena Garcia", id_number: "A-219847362", photo_url: "/avatars/1.jpg", chapter: "Texas", state_code: "TX", status: "pending_verification", preferred_language: "es", family_size: 4, registered_by: "James Wilson", verified_by: null, notes: "Family from Venezuela. Two school-age children.", created_at: "2026-04-05T09:15:00Z" },
  { id: "2", full_name: "Ahmad Fazli Razavi", id_number: "P-AF48291037", photo_url: "/avatars/2.jpg", chapter: "California", state_code: "CA", status: "verified", preferred_language: "prs", family_size: 5, registered_by: "Sarah Chen", verified_by: "Admin Lopez", notes: null, created_at: "2026-04-04T11:30:00Z" },
  { id: "3", full_name: "Olena Bondarenko", id_number: "UA-9281746", photo_url: "/avatars/3.jpg", chapter: "Illinois", state_code: "IL", status: "pending_verification", preferred_language: "uk", family_size: 3, registered_by: "Mike Rodriguez", verified_by: null, notes: "Arrived from Kharkiv. Husband still in Ukraine.", created_at: "2026-04-05T07:45:00Z" },
  { id: "4", full_name: "Jean-Pierre Toussaint", id_number: "HT-834721", photo_url: "/avatars/4.jpg", chapter: "Florida", state_code: "FL", status: "verified", preferred_language: "ht", family_size: 3, registered_by: "Ana Morales", verified_by: "Admin Davis", notes: null, created_at: "2026-04-03T14:00:00Z" },
  { id: "5", full_name: "Fatima Yusuf Ali", id_number: "A-382917461", photo_url: "/avatars/5.jpg", chapter: "Ohio", state_code: "OH", status: "rejected", preferred_language: "en", family_size: 6, registered_by: "Tom Baker", verified_by: "Admin Singh", notes: "Duplicate entry — same ID number as existing record #A-382917461", created_at: "2026-04-02T16:20:00Z" },
  { id: "6", full_name: "Carlos Alberto Mendez", id_number: "A-472918365", photo_url: "/avatars/6.jpg", chapter: "Texas", state_code: "TX", status: "pending_verification", preferred_language: "es", family_size: 7, registered_by: "James Wilson", verified_by: null, notes: "Large family. Elderly grandmother included.", created_at: "2026-04-05T10:00:00Z" },
  { id: "7", full_name: "Nadia Ahmadi", id_number: "P-IR92837146", photo_url: "/avatars/7.jpg", chapter: "California", state_code: "CA", status: "verified", preferred_language: "prs", family_size: 2, registered_by: "Sarah Chen", verified_by: "Admin Lopez", notes: null, created_at: "2026-04-01T09:00:00Z" },
];

const LANG_MAP: Record<string, string> = {
  en: "English", es: "Spanish", ar: "Arabic", prs: "Dari",
  ps: "Pashto", uk: "Ukrainian", ht: "Haitian Creole", fr: "French",
};

function statusBadge(status: string) {
  switch (status) {
    case "pending_verification": return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    case "verified": return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Verified</Badge>;
    case "rejected": return <Badge variant="error" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function ArrivalsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");

  const filtered = useMemo(() => {
    let data = [...mockArrivals];
    if (statusFilter !== "all") data = data.filter((a) => a.status === statusFilter);
    if (chapterFilter !== "all") data = data.filter((a) => a.chapter === chapterFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((a) =>
        a.full_name.toLowerCase().includes(q) ||
        a.id_number.toLowerCase().includes(q) ||
        a.chapter.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, statusFilter, chapterFilter]);

  const pendingCount = mockArrivals.filter((a) => a.status === "pending_verification").length;
  const verifiedCount = mockArrivals.filter((a) => a.status === "verified").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">New Arrivals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mockArrivals.length} total · {pendingCount} pending verification · {verifiedCount} verified
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />Register Arrival
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending Verification</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">AI Fraud Flags</p>
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
              <Input placeholder="Search by name or ID number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_verification">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
              <TableHead>Person</TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Chapter</TableHead>
              <TableHead>Family</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Registered By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No arrivals found.</TableCell>
              </TableRow>
            ) : (
              filtered.map((arrival) => (
                <TableRow key={arrival.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {arrival.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{arrival.full_name}</p>
                        {arrival.notes && <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{arrival.notes}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{arrival.id_number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-[9px] font-bold text-primary">{arrival.state_code}</span>
                      <span className="text-sm">{arrival.chapter}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{arrival.family_size}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {LANG_MAP[arrival.preferred_language] || arrival.preferred_language}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{arrival.registered_by}</TableCell>
                  <TableCell>{statusBadge(arrival.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {arrival.status === "pending_verification" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700" title="Verify">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
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
