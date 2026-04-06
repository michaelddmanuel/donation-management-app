"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  ShieldAlert,
  Map,
  FileText,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AIInsight {
  id: string;
  type: "prediction" | "anomaly" | "recommendation" | "alert";
  title: string;
  description: string;
  confidence: number;
  chapter: string | null;
  created_at: string;
  action_label: string | null;
}

const mockInsights: AIInsight[] = [
  { id: "1", type: "prediction", title: "Texas diapers will deplete in 7 days", description: "Based on current burn rate of 24/day with 168 units remaining. Recommend procurement of 500+ units from Sam's Club (best price: $0.18/unit).", confidence: 94, chapter: "Texas", created_at: "2 hours ago", action_label: "Create Purchase Order" },
  { id: "2", type: "anomaly", title: "Oklahoma electronics purchase flagged", description: "Best Buy #329 — $2,100 electronics purchase is 3.8σ above the category average. This chapter has no prior electronics spending above $200.", confidence: 97, chapter: "Oklahoma", created_at: "5 hours ago", action_label: "Review Transaction" },
  { id: "3", type: "recommendation", title: "Route optimization: IL deliveries", description: "7 pending deliveries in the Chicago Metro area can be consolidated into 2 optimized routes, saving an estimated 45 minutes and 12 miles.", confidence: 88, chapter: "Illinois", created_at: "3 hours ago", action_label: "View Routes" },
  { id: "4", type: "alert", title: "3 critical help requests unassigned > 4 hours", description: "Help requests from Maria Elena Garcia (TX), Olena Bondarenko (IL), and Carlos Alberto Mendez (TX) have urgency scores > 80 and no assigned volunteer.", confidence: 100, chapter: null, created_at: "1 hour ago", action_label: "Assign Volunteers" },
  { id: "5", type: "prediction", title: "Winter coat demand spike expected", description: "Historical data shows 340% increase in coat requests during Oct-Dec. Current IL stock of 156 coats insufficient. Recommend early procurement.", confidence: 91, chapter: "Illinois", created_at: "6 hours ago", action_label: "Plan Procurement" },
  { id: "6", type: "recommendation", title: "Smart matching: Baby essentials → Fatima", description: "New arrival Fatima Al-Said (CA, family of 6 with infant) matches Baby Essentials care package template. Auto-assemble recommended.", confidence: 86, chapter: "California", created_at: "4 hours ago", action_label: "Assemble Package" },
];

function typeConfig(type: string) {
  switch (type) {
    case "prediction": return { icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    case "anomaly": return { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    case "recommendation": return { icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
    case "alert": return { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-500/10", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    default: return { icon: Sparkles, color: "text-primary", bg: "bg-primary/10", badge: "" };
  }
}

export default function AIHubPage() {
  const alerts = mockInsights.filter((i) => i.type === "alert" || i.type === "anomaly");
  const predictions = mockInsights.filter((i) => i.type === "prediction");
  const recommendations = mockInsights.filter((i) => i.type === "recommendation");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            AI Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gemini-powered insights, anomaly detection, and predictive analytics
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />Refresh Insights
        </Button>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dashboard/ai/fraud">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-50 dark:bg-red-500/10">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Fraud Alerts</p>
                <p className="text-xs text-muted-foreground">{alerts.length} active</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/ai/routes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <Map className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Route Optimizer</p>
                <p className="text-xs text-muted-foreground">7 pending routes</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/ai/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                <FileText className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Impact Reports</p>
                <p className="text-xs text-muted-foreground">Generate narratives</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">AI Score</p>
              <p className="text-xs text-muted-foreground">92% operational health</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights feed */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Insights</h2>
        {mockInsights.map((insight) => {
          const config = typeConfig(insight.type);
          const Icon = config.icon;
          return (
            <Card key={insight.id} className={insight.type === "anomaly" || insight.type === "alert" ? "border-destructive/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg shrink-0 ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${config.badge}`}>
                        {insight.type.toUpperCase()}
                      </span>
                      {insight.chapter && (
                        <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{insight.chapter}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">{insight.created_at}</span>
                    </div>
                    <h3 className="text-sm font-medium text-foreground mt-1">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${insight.confidence}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{insight.confidence}%</span>
                      </div>
                      {insight.action_label && (
                        <Button variant="outline" size="sm" className="h-7 text-xs ml-auto">
                          {insight.action_label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
