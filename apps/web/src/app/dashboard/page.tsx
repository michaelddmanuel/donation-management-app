import {
  Package,
  Users,
  HandHeart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data — replace with Supabase queries
const stats = [
  {
    title: "Total Inventory Value",
    value: "$284,320",
    change: "+12.5%",
    trend: "up" as const,
    icon: Package,
    description: "Across all 12 active chapters",
  },
  {
    title: "Families Served (30d)",
    value: "1,247",
    change: "+8.2%",
    trend: "up" as const,
    icon: HandHeart,
    description: "Care packages distributed",
  },
  {
    title: "Active Volunteers",
    value: "342",
    change: "+3.1%",
    trend: "up" as const,
    icon: Users,
    description: "Across all chapters",
  },
  {
    title: "Cash Donations (30d)",
    value: "$47,890",
    change: "-2.4%",
    trend: "down" as const,
    icon: DollarSign,
    description: "Online + Cash + Check",
  },
];

const urgentAlerts = [
  {
    id: 1,
    type: "low_stock",
    message: "Texas chapter: Baby formula at 3 units — critically low",
    severity: "critical",
  },
  {
    id: 2,
    type: "fraud",
    message: "AI flagged: Duplicate ID photo detected across 2 profiles",
    severity: "warning",
  },
  {
    id: 3,
    type: "request",
    message: "High-urgency request: Family with newborn needs formula (Score: 94)",
    severity: "critical",
  },
  {
    id: 4,
    type: "procurement",
    message: "Amazon order #A-4821 received — 48 items pending intake",
    severity: "info",
  },
];

const recentDistributions = [
  { chapter: "California", family: "Rodriguez Family", items: 12, value: "$245", time: "2 min ago" },
  { chapter: "Texas", family: "Ahmed Family", items: 8, value: "$189", time: "15 min ago" },
  { chapter: "New York", family: "Chen Family", items: 15, value: "$320", time: "32 min ago" },
  { chapter: "Florida", family: "Williams Family", items: 6, value: "$142", time: "1 hr ago" },
  { chapter: "Illinois", family: "Nguyen Family", items: 10, value: "$220", time: "2 hr ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-display-xs font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of your donation operations across all chapters.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge
                  variant={stat.trend === "up" ? "success" : "error"}
                  className="gap-1"
                >
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-display-xs font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.title}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Urgent Alerts — wider */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Urgent Alerts
              </CardTitle>
              <Badge variant="warning">{urgentAlerts.length} active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div
                    className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      alert.severity === "critical"
                        ? "bg-destructive"
                        : alert.severity === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <p className="text-sm text-foreground">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Distributions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Distributions</CardTitle>
              <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDistributions.map((dist, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {dist.chapter.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {dist.family}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {dist.chapter} · {dist.items} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {dist.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{dist.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/20">
              <span className="text-xl">🧠</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                AI Insight — Predictive Alert
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                At the current burn rate, <strong>Texas</strong> will run out of Care Packages in{" "}
                <strong className="text-destructive">4 days</strong>. Oklahoma has 200+ surplus units.
                Recommend inter-chapter transfer or executing the &quot;Winter Prep&quot; Amazon order
                ($2,340).
              </p>
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  Initiate Transfer
                </button>
                <button className="px-3 py-1.5 text-sm font-medium bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors">
                  View Forecast
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
