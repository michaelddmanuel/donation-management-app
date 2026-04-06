"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  ChevronRight,
  ArrowUpDown,
  Phone,
  Globe,
  Users,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HelpRequest {
  id: string;
  requester_name: string;
  chapter: string;
  state_code: string;
  description: string;
  original_text: string | null;
  translated_text: string | null;
  category: string;
  urgency_score: number;
  status: string;
  family_size: number;
  preferred_language: string;
  assigned_volunteer: string | null;
  created_at: string;
  source: "app" | "whatsapp" | "sms" | "walk_in";
}

const mockRequests: HelpRequest[] = [
  { id: "1", requester_name: "Maria Garcia", chapter: "Texas", state_code: "TX", description: "We have no formula for the baby. He is 3 months old and we ran out yesterday.", original_text: "No tenemos fórmula para el bebé. Tiene 3 meses y se nos acabó ayer.", translated_text: "We have no formula for the baby. He is 3 months old and we ran out yesterday.", category: "baby_supplies", urgency_score: 96, status: "pending", family_size: 4, preferred_language: "es", assigned_volunteer: null, created_at: "2026-04-05T08:30:00Z", source: "whatsapp" },
  { id: "2", requester_name: "Ahmad Razavi", chapter: "California", state_code: "CA", description: "Need winter clothes for children ages 5 and 8. Also need school supplies.", original_text: null, translated_text: null, category: "clothing", urgency_score: 52, status: "pending", family_size: 5, preferred_language: "prs", assigned_volunteer: null, created_at: "2026-04-04T14:22:00Z", source: "app" },
  { id: "3", requester_name: "Fatima Hassan", chapter: "New York", state_code: "NY", description: "My husband needs blood pressure medication. We cannot afford it and the pharmacy won't give it without insurance.", original_text: null, translated_text: null, category: "medical", urgency_score: 88, status: "assigned", family_size: 3, preferred_language: "ar", assigned_volunteer: "Sarah Chen", created_at: "2026-04-04T11:00:00Z", source: "sms" },
  { id: "4", requester_name: "Olena Kovalenko", chapter: "Illinois", state_code: "IL", description: "We just arrived and have nothing. Need food, hygiene items, and blankets for family of 6.", original_text: null, translated_text: null, category: "food", urgency_score: 82, status: "pending", family_size: 6, preferred_language: "uk", assigned_volunteer: null, created_at: "2026-04-05T06:15:00Z", source: "walk_in" },
  { id: "5", requester_name: "Jean-Pierre Toussaint", chapter: "Florida", state_code: "FL", description: "Need diapers size 2 and baby wipes. Also looking for a crib if possible.", original_text: "Bezwen kouchèt tay 2 ak baby wipes. Mwen ap chèche yon bèso tou si posib.", translated_text: "Need diapers size 2 and baby wipes. Also looking for a crib if possible.", category: "baby_supplies", urgency_score: 68, status: "pending", family_size: 3, preferred_language: "ht", assigned_volunteer: null, created_at: "2026-04-04T16:45:00Z", source: "whatsapp" },
  { id: "6", requester_name: "Li Wei", chapter: "California", state_code: "CA", description: "We need extra blankets and warm clothes. The apartment is cold at night.", original_text: null, translated_text: null, category: "household", urgency_score: 45, status: "in_progress", family_size: 2, preferred_language: "en", assigned_volunteer: "Mike Rodriguez", created_at: "2026-04-03T09:30:00Z", source: "app" },
  { id: "7", requester_name: "Amina Yusuf", chapter: "Ohio", state_code: "OH", description: "My daughter needs school supplies. She starts 3rd grade next week and we don't have anything.", original_text: null, translated_text: null, category: "school_supplies", urgency_score: 58, status: "pending", family_size: 4, preferred_language: "en", assigned_volunteer: null, created_at: "2026-04-05T10:00:00Z", source: "app" },
  { id: "8", requester_name: "Carlos Mendez", chapter: "Texas", state_code: "TX", description: "Running low on food. Family of 7 and the food bank is closed until next week.", original_text: "Nos estamos quedando sin comida. Familia de 7 y el banco de alimentos está cerrado hasta la próxima semana.", translated_text: "Running low on food. Family of 7 and the food bank is closed until next week.", category: "food", urgency_score: 78, status: "pending", family_size: 7, preferred_language: "es", assigned_volunteer: null, created_at: "2026-04-05T07:00:00Z", source: "sms" },
];

function getUrgencyColor(score: number) {
  if (score >= 90) return "bg-red-500";
  if (score >= 70) return "bg-orange-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-green-500";
}

function getUrgencyLabel(score: number) {
  if (score >= 90) return "Critical";
  if (score >= 70) return "High";
  if (score >= 40) return "Moderate";
  return "Low";
}

function getUrgencyBadge(score: number) {
  if (score >= 90) return "error";
  if (score >= 70) return "warning";
  return "secondary";
}

function getStatusBadge(status: string) {
  switch (status) {
    case "pending": return "warning";
    case "assigned": return "secondary";
    case "in_progress": return "default";
    case "fulfilled": return "success";
    default: return "secondary";
  }
}

function getSourceIcon(source: string) {
  switch (source) {
    case "whatsapp": return "💬";
    case "sms": return "📱";
    case "walk_in": return "🚶";
    default: return "📲";
  }
}

function timeAgo(dateStr: string) {
  const now = new Date("2026-04-05T12:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return `${Math.floor(diffMs / (1000 * 60))}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

const LANG_NAMES: Record<string, string> = {
  en: "English", es: "Spanish", ar: "Arabic", prs: "Dari",
  ps: "Pashto", uk: "Ukrainian", ht: "Haitian Creole", fr: "French",
};

export default function RequestsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);

  const filtered = useMemo(() => {
    let data = [...mockRequests];
    if (statusFilter !== "all") data = data.filter((r) => r.status === statusFilter);
    if (urgencyFilter === "critical") data = data.filter((r) => r.urgency_score >= 90);
    else if (urgencyFilter === "high") data = data.filter((r) => r.urgency_score >= 70);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.requester_name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.chapter.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => b.urgency_score - a.urgency_score);
    return data;
  }, [search, statusFilter, urgencyFilter]);

  const criticalCount = mockRequests.filter((r) => r.urgency_score >= 90 && r.status === "pending").length;
  const pendingCount = mockRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">Help Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pendingCount} pending · {criticalCount} critical — AI-sorted by urgency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Zap className="h-4 w-4" />
            Run AI Scoring
          </Button>
          <Button size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>

      {/* Critical alert */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>{criticalCount} critical request{criticalCount > 1 ? "s" : ""}</strong> need immediate attention. These involve urgent health or safety concerns.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, description, or chapter..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="critical">Critical (90+)</SelectItem>
            <SelectItem value="high">High (70+)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Request List */}
        <div className="lg:col-span-3 space-y-3">
          {filtered.map((req) => (
            <Card
              key={req.id}
              className={`cursor-pointer transition-all hover:shadow-sm ${
                selectedRequest?.id === req.id ? "ring-2 ring-primary" : ""
              } ${req.urgency_score >= 90 ? "border-red-200 dark:border-red-500/30" : ""}`}
              onClick={() => setSelectedRequest(req)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Urgency bar */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className={`w-3 h-3 rounded-full ${getUrgencyColor(req.urgency_score)}`} />
                    <span className="text-xs font-bold text-muted-foreground">{req.urgency_score}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{req.requester_name}</h3>
                      <span className="text-lg" title={req.source}>{getSourceIcon(req.source)}</span>
                      <Badge variant={getUrgencyBadge(req.urgency_score) as any}>{getUrgencyLabel(req.urgency_score)}</Badge>
                      <Badge variant={getStatusBadge(req.status) as any} className="capitalize">{req.status.replace("_", " ")}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.description}</p>

                    {req.original_text && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic line-clamp-1">
                        Original: &ldquo;{req.original_text}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/10 text-[9px] font-bold text-primary">{req.state_code}</span>
                        {req.chapter}
                      </span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Family of {req.family_size}</span>
                      <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {LANG_NAMES[req.preferred_language] || req.preferred_language}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(req.created_at)}</span>
                    </div>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selectedRequest ? (
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedRequest.requester_name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getUrgencyColor(selectedRequest.urgency_score)}`} />
                    <span className="text-sm font-bold">{selectedRequest.urgency_score}/100</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Request details */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Request</p>
                  <p className="text-sm text-foreground">{selectedRequest.description}</p>
                </div>

                {selectedRequest.original_text && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Original ({LANG_NAMES[selectedRequest.preferred_language]})</p>
                    <p className="text-sm text-muted-foreground italic">{selectedRequest.original_text}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Chapter</p>
                    <p className="text-sm font-medium">{selectedRequest.chapter}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium capitalize">{selectedRequest.category.replace("_", " ")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Family Size</p>
                    <p className="text-sm font-medium">{selectedRequest.family_size} members</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="text-sm font-medium capitalize">{getSourceIcon(selectedRequest.source)} {selectedRequest.source.replace("_", " ")}</p>
                  </div>
                </div>

                {selectedRequest.assigned_volunteer && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="text-sm font-medium text-primary">{selectedRequest.assigned_volunteer}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  {selectedRequest.status === "pending" && (
                    <Button className="w-full gap-2">
                      <User className="h-4 w-4" />
                      Assign Volunteer
                    </Button>
                  )}
                  <Button variant="outline" className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send Message ({LANG_NAMES[selectedRequest.preferred_language]})
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Call Requester
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a request to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
