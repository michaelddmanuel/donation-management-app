"use client";

import { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ThumbsDown,
  ThumbsUp,
  DollarSign,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface FraudAlert {
  id: string;
  severity: "critical" | "high" | "medium";
  type: string;
  title: string;
  description: string;
  chapter: string;
  amount: number;
  vendor: string | null;
  deviation: string;
  status: "pending_review" | "confirmed" | "dismissed";
  detected_at: string;
}

const mockAlerts: FraudAlert[] = [
  { id: "1", severity: "critical", type: "Spending Anomaly", title: "Electronics purchase — Oklahoma", description: "Best Buy #329 — $2,100 electronics purchase. This chapter has no prior electronics spending above $200. Purchase is 3.8σ above category mean.", chapter: "Oklahoma", amount: 2100, vendor: "Best Buy #329", deviation: "3.8σ", status: "pending_review", detected_at: "5 hours ago" },
  { id: "2", severity: "high", type: "Spending Anomaly", title: "Winter coats purchase — Illinois", description: "Burlington Store #412 — $1,234 clothing purchase. Amount is 3.2σ above the category average for this chapter. Prior monthly average: $380.", chapter: "Illinois", amount: 1234, vendor: "Burlington Store #412", deviation: "3.2σ", status: "pending_review", detected_at: "1 day ago" },
  { id: "3", severity: "medium", type: "Pattern Anomaly", title: "Unusual procurement frequency — Texas", description: "Texas chapter processed 8 procurement transactions in the last 48 hours, compared to average of 3. Total value: $2,847. No weekend procurement is typical.", chapter: "Texas", amount: 2847, vendor: null, deviation: "2.4σ", status: "pending_review", detected_at: "2 days ago" },
  { id: "4", severity: "high", type: "Duplicate Detection", title: "Possible duplicate arrival registration", description: "Two profiles with matching ID numbers detected: A-382917461. Fatima Yusuf Ali registered in OH and a second attempt detected from GA chapter.", chapter: "Ohio / Georgia", amount: 0, vendor: null, deviation: "Exact Match", status: "confirmed", detected_at: "3 days ago" },
  { id: "5", severity: "medium", type: "Vendor Anomaly", title: "New vendor — first-time high-value purchase", description: "First transaction with 'Global Supplies Co.' for $890 in California chapter. No prior vendor relationship. Recommend vendor verification.", chapter: "California", amount: 890, vendor: "Global Supplies Co.", deviation: "New Vendor", status: "dismissed", detected_at: "4 days ago" },
];

function severityBadge(severity: string) {
  switch (severity) {
    case "critical": return <Badge variant="error" className="gap-1"><AlertTriangle className="h-3 w-3" />Critical</Badge>;
    case "high": return <Badge variant="warning" className="gap-1">High</Badge>;
    case "medium": return <Badge variant="secondary" className="gap-1">Medium</Badge>;
    default: return <Badge variant="secondary">{severity}</Badge>;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "pending_review": return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Review</Badge>;
    case "confirmed": return <Badge variant="error" className="gap-1"><ShieldAlert className="h-3 w-3" />Confirmed</Badge>;
    case "dismissed": return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" />Dismissed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function FraudAlertsPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = statusFilter === "all" ? mockAlerts : mockAlerts.filter((a) => a.status === statusFilter);
  const pendingCount = mockAlerts.filter((a) => a.status === "pending_review").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-destructive" />
            Fraud Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-detected anomalies in spending, procurement, and registrations
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({mockAlerts.length})</SelectItem>
            <SelectItem value="pending_review">Pending ({pendingCount})</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pendingCount > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive font-medium">{pendingCount} alerts require review</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filtered.map((alert) => (
          <Card key={alert.id} className={alert.status === "pending_review" ? (alert.severity === "critical" ? "border-destructive/50" : "border-amber-300/50") : "opacity-75"}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${alert.severity === "critical" ? "bg-red-50 dark:bg-red-500/10" : alert.severity === "high" ? "bg-amber-50 dark:bg-amber-500/10" : "bg-muted"}`}>
                  <ShieldAlert className={`h-5 w-5 ${alert.severity === "critical" ? "text-red-600" : alert.severity === "high" ? "text-amber-600" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {severityBadge(alert.severity)}
                    {statusBadge(alert.status)}
                    <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{alert.type}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{alert.detected_at}</span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground mt-2">{alert.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">Chapter: <strong className="text-foreground">{alert.chapter}</strong></span>
                    {alert.amount > 0 && <span className="text-xs text-muted-foreground">Amount: <strong className="text-foreground">${alert.amount.toLocaleString()}</strong></span>}
                    {alert.vendor && <span className="text-xs text-muted-foreground">Vendor: <strong className="text-foreground">{alert.vendor}</strong></span>}
                    <span className="text-xs text-muted-foreground">Deviation: <strong className="text-foreground font-mono">{alert.deviation}</strong></span>
                  </div>
                  {alert.status === "pending_review" && (
                    <div className="flex items-center gap-2 mt-4">
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7">
                        <Eye className="h-3 w-3" />View Details
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-red-600 border-red-200 hover:bg-red-50">
                        <ThumbsDown className="h-3 w-3" />Confirm Fraud
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                        <ThumbsUp className="h-3 w-3" />Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
