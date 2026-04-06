"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Key,
  Save,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface SettingsSection {
  id: string;
  label: string;
  icon: typeof SettingsIcon;
  description: string;
}

const sections: SettingsSection[] = [
  { id: "organization", label: "Organization", icon: Building2, description: "Name, contact, branding" },
  { id: "chapters", label: "Chapters", icon: Globe, description: "Manage state chapters" },
  { id: "users", label: "Users & Roles", icon: Users, description: "Team members & permissions" },
  { id: "notifications", label: "Notifications", icon: Bell, description: "Email, push & alert settings" },
  { id: "security", label: "Security", icon: Shield, description: "Auth, RLS, sessions" },
  { id: "integrations", label: "Integrations", icon: Key, description: "Twilio, Gemini, APIs" },
  { id: "appearance", label: "Appearance", icon: Palette, description: "Theme & display" },
  { id: "database", label: "Database", icon: Database, description: "Supabase, migrations" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState("organization");
  const [orgName, setOrgName] = useState("DonationHub");
  const [adminEmail, setAdminEmail] = useState("admin@donationhub.org");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-xs font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="h-7 w-7 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your organization and app configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="h-fit">
          <CardContent className="p-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActive(section.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                    active === section.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-[10px] text-muted-foreground">{section.description}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-6">
          {active === "organization" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Settings</CardTitle>
                <CardDescription>Basic info about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Organization Name</label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Admin Email</label>
                  <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} type="email" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Default Timezone</label>
                  <Select defaultValue="america_chicago">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_new_york">Eastern (ET)</SelectItem>
                      <SelectItem value="america_chicago">Central (CT)</SelectItem>
                      <SelectItem value="america_denver">Mountain (MT)</SelectItem>
                      <SelectItem value="america_los_angeles">Pacific (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2"><Save className="h-4 w-4" />Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {active === "chapters" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">State Chapters</CardTitle>
                <CardDescription>12 chapters across the United States</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["California", "Texas", "New York", "Florida", "Illinois", "Oklahoma", "Ohio", "Georgia", "Arizona", "Washington", "Virginia", "Colorado"].map((ch) => (
                    <div key={ch} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="text-sm font-medium">{ch}</span>
                      <Badge variant="success" className="text-[9px]">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {active === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>Control how you receive alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive daily digest and alerts</p>
                  </div>
                  <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Browser and mobile notifications</p>
                  </div>
                  <Toggle checked={pushNotifs} onChange={setPushNotifs} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Urgent Request Alerts</p>
                    <p className="text-xs text-muted-foreground">Immediate alert for critical help requests</p>
                  </div>
                  <Toggle checked={urgentAlerts} onChange={setUrgentAlerts} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">AI Fraud Alerts</p>
                    <p className="text-xs text-muted-foreground">Notify when anomalies are detected</p>
                  </div>
                  <Toggle checked={fraudAlerts} onChange={setFraudAlerts} />
                </div>
                <Button className="gap-2"><Save className="h-4 w-4" />Save Preferences</Button>
              </CardContent>
            </Card>
          )}

          {active === "integrations" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Integrations</CardTitle>
                <CardDescription>Connect external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600">SB</div>
                    <div>
                      <p className="text-sm font-medium">Supabase</p>
                      <p className="text-xs text-muted-foreground">Database & Auth</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">G</div>
                    <div>
                      <p className="text-sm font-medium">Google Gemini</p>
                      <p className="text-xs text-muted-foreground">AI / Vision / NLP</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-600">TW</div>
                    <div>
                      <p className="text-sm font-medium">Twilio</p>
                      <p className="text-xs text-muted-foreground">WhatsApp & SMS</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7">Configure</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {active === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Use dark theme across the app</p>
                  </div>
                  <Toggle checked={darkMode} onChange={setDarkMode} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Accent Color</label>
                  <div className="flex gap-2">
                    {["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"].map((color) => (
                      <button key={color} className={`h-8 w-8 rounded-full border-2 ${color === "#7C3AED" ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(active === "security" || active === "users" || active === "database") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{sections.find((s) => s.id === active)?.label}</CardTitle>
                <CardDescription>Configuration options for {sections.find((s) => s.id === active)?.label?.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage {sections.find((s) => s.id === active)?.label?.toLowerCase()} settings through your Supabase dashboard for maximum security.
                </p>
                <Button variant="outline" size="sm" className="mt-4 text-xs">Open Supabase Dashboard</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
