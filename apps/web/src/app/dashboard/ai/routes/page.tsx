"use client";

import {
  Map,
  MapPin,
  Truck,
  Clock,
  Users,
  Navigation,
  Zap,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Route {
  id: string;
  chapter: string;
  state_code: string;
  stops: { name: string; address: string; package: string; priority: "high" | "normal" }[];
  total_miles: number;
  estimated_time: string;
  volunteer: string | null;
  status: "optimized" | "in_progress" | "completed";
  savings: string;
}

const mockRoutes: Route[] = [
  {
    id: "R-001", chapter: "Illinois", state_code: "IL",
    stops: [
      { name: "Olena Bondarenko", address: "1420 N Damen Ave, Chicago", package: "Winter Bundle", priority: "high" },
      { name: "Wei Chen Family", address: "2301 S Wentworth Ave, Chicago", package: "Welcome Kit", priority: "normal" },
      { name: "Joseph Ndugu", address: "1156 W Roosevelt Rd, Chicago", package: "Hygiene Pack", priority: "normal" },
      { name: "Fatima Hassan", address: "4820 N Broadway, Chicago", package: "Baby Essentials", priority: "high" },
    ],
    total_miles: 18.4, estimated_time: "52 min", volunteer: "Mike Rodriguez", status: "optimized", savings: "Saves 12 mi vs. sequential"
  },
  {
    id: "R-002", chapter: "Texas", state_code: "TX",
    stops: [
      { name: "Maria Elena Garcia", address: "2205 E Riverside Dr, Austin", package: "Welcome Kit", priority: "high" },
      { name: "Carlos Alberto Mendez", address: "8401 N Lamar Blvd, Austin", package: "School Supplies", priority: "normal" },
      { name: "Lucia Fernandez", address: "6001 Airport Blvd, Austin", package: "Hygiene Pack", priority: "normal" },
    ],
    total_miles: 14.2, estimated_time: "38 min", volunteer: "James Wilson", status: "in_progress", savings: "Saves 8 mi vs. sequential"
  },
  {
    id: "R-003", chapter: "California", state_code: "CA",
    stops: [
      { name: "Nadia Ahmadi", address: "890 Market St, San Francisco", package: "Welcome Kit", priority: "normal" },
      { name: "Jun Park Family", address: "1245 Clement St, San Francisco", package: "Baby Essentials", priority: "high" },
    ],
    total_miles: 6.1, estimated_time: "18 min", volunteer: null, status: "optimized", savings: "Direct route — 2 stops"
  },
];

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground flex items-center gap-2">
            <Map className="h-7 w-7 text-blue-600" />
            Route Optimizer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-optimized delivery routes using PostGIS and Google Maps
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" />Re-optimize All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10"><Navigation className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockRoutes.length}</p>
              <p className="text-xs text-muted-foreground">Active Routes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10"><Zap className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">20 mi</p>
              <p className="text-xs text-muted-foreground">Miles Saved Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">1h 48m</p>
              <p className="text-xs text-muted-foreground">Total Est. Time</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10"><MapPin className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockRoutes.reduce((s, r) => s + r.stops.length, 0)}</p>
              <p className="text-xs text-muted-foreground">Total Stops</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes */}
      <div className="space-y-4">
        {mockRoutes.map((route, ri) => (
          <Card key={route.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className={`h-4 w-4 ${route.status === "in_progress" ? "text-blue-600" : "text-muted-foreground"}`} />
                  {route.id} — {route.chapter}
                  <Badge variant={route.status === "in_progress" ? "default" : route.status === "completed" ? "success" : "secondary"} className="text-[10px]">
                    {route.status === "in_progress" ? "In Progress" : route.status === "completed" ? "Completed" : "Ready"}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Navigation className="h-3 w-3" />{route.total_miles} mi</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{route.estimated_time}</span>
                  {route.volunteer && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{route.volunteer}</span>}
                </div>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <Zap className="h-3 w-3" />{route.savings}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {route.stops.map((stop, si) => (
                  <div key={si} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold text-white ${stop.priority === "high" ? "bg-red-500" : "bg-primary"}`}>
                        {si + 1}
                      </div>
                      {si < route.stops.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{stop.name}</p>
                        <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{stop.package}</span>
                        {stop.priority === "high" && <Badge variant="error" className="text-[9px] h-4">Priority</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{stop.address}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                {!route.volunteer && (
                  <Button size="sm" className="text-xs h-7">Assign Volunteer</Button>
                )}
                <Button variant="outline" size="sm" className="text-xs h-7">Open in Maps</Button>
                {route.status === "in_progress" && (
                  <Button variant="outline" size="sm" className="text-xs h-7 text-emerald-600 border-emerald-200 hover:bg-emerald-50 ml-auto gap-1">
                    <CheckCircle2 className="h-3 w-3" />Mark Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
