"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ── Inline mock chart components (replace with Recharts once wired) ── */

function BarChartMock({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 px-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] font-medium text-foreground">{d.value}</span>
          <div
            className="w-full rounded-t bg-primary/80 min-h-[4px] transition-all"
            style={{ height: `${(d.value / max) * (height - 40)}px` }}
          />
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChartMock({ data, color = "text-primary" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 120;
  const w = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full h-[${h}px] ${color}`} preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function DonutChartMock({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg) => {
            const pct = (seg.value / total) * 100;
            const offset = cumulative;
            cumulative += pct;
            return (
              <circle
                key={seg.label}
                cx="18" cy="18" r="15.9155"
                fill="none"
                stroke={seg.color}
                strokeWidth="3"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={`${-offset}`}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{total.toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
            <span className="font-medium ml-auto">{seg.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Data ── */

const monthlyDistributions = [
  { label: "Nov", value: 142 },
  { label: "Dec", value: 198 },
  { label: "Jan", value: 167 },
  { label: "Feb", value: 183 },
  { label: "Mar", value: 221 },
  { label: "Apr", value: 89 },
];

const fmvByCategory = [
  { label: "Clothing", value: 12400, color: "#7C3AED" },
  { label: "Food", value: 8900, color: "#10B981" },
  { label: "Hygiene", value: 4200, color: "#F59E0B" },
  { label: "Baby", value: 6100, color: "#3B82F6" },
  { label: "Furniture", value: 3800, color: "#EF4444" },
  { label: "Other", value: 2100, color: "#6B7280" },
];

const burnRates = [
  { category: "Diapers", daily: 24, stock: 312, daysLeft: 13, trend: "up" as const },
  { category: "Rice (25lb)", daily: 3.2, stock: 45, daysLeft: 14, trend: "stable" as const },
  { category: "Winter Coats", daily: 8, stock: 156, daysLeft: 20, trend: "down" as const },
  { category: "Hygiene Kits", daily: 12, stock: 89, daysLeft: 7, trend: "up" as const },
  { category: "Blankets", daily: 5, stock: 210, daysLeft: 42, trend: "stable" as const },
  { category: "School Supplies", daily: 6, stock: 134, daysLeft: 22, trend: "down" as const },
];

const chapterComparison = [
  { label: "TX", value: 342 },
  { label: "CA", value: 289 },
  { label: "NY", value: 234 },
  { label: "FL", value: 198 },
  { label: "IL", value: 167 },
  { label: "OH", value: 123 },
  { label: "OK", value: 98 },
  { label: "GA", value: 87 },
];

const donationTrend = [1200, 1800, 1400, 2200, 1900, 3100, 2800, 4150];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inventory FMV, burn rates, distribution trends, and chapter performance
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Total FMV</p>
              <Badge variant="success" className="text-[10px]"><ArrowUpRight className="h-3 w-3 mr-0.5" />+12%</Badge>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">$37,500</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Families Served</p>
              <Badge variant="success" className="text-[10px]"><ArrowUpRight className="h-3 w-3 mr-0.5" />+8%</Badge>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">1,089</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Distributions</p>
              <Badge variant="success" className="text-[10px]"><ArrowUpRight className="h-3 w-3 mr-0.5" />+15%</Badge>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">221</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-medium">Cash Donations</p>
              <Badge variant="warning" className="text-[10px]"><ArrowDownRight className="h-3 w-3 mr-0.5" />-3%</Badge>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">$4,150</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Monthly Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartMock data={monthlyDistributions} height={180} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Inventory FMV by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChartMock segments={fmvByCategory} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Donation Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <LineChartMock data={donationTrend} />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
              <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Distributions by Chapter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartMock data={chapterComparison} height={180} />
          </CardContent>
        </Card>
      </div>

      {/* Burn Rates Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Burn Rate Forecast
            <Badge variant="secondary" className="ml-auto text-[10px]">AI Predicted</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {burnRates.map((item) => (
              <div key={item.category} className={`flex items-center justify-between p-3 rounded-lg border ${item.daysLeft <= 10 ? "border-destructive/50 bg-destructive/5" : item.daysLeft <= 14 ? "border-amber-300/50 bg-amber-50/50 dark:bg-amber-900/5" : "border-border"}`}>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.category}</p>
                  <p className="text-xs text-muted-foreground">{item.daily}/day · {item.stock} in stock</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.daysLeft <= 10 ? "text-destructive" : item.daysLeft <= 14 ? "text-amber-600" : "text-foreground"}`}>
                    {item.daysLeft}d left
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-0.5">
                    {item.trend === "up" && <><ArrowUpRight className="h-3 w-3 text-red-500" />↑ usage</>}
                    {item.trend === "down" && <><ArrowDownRight className="h-3 w-3 text-emerald-500" />↓ usage</>}
                    {item.trend === "stable" && "stable"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
