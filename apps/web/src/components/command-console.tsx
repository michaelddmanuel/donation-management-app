"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Command,
  Package,
  Users,
  Heart,
  Truck,
  FileText,
  Brain,
  BarChart3,
  ShieldAlert,
  Map,
  Settings,
  UserPlus,
  DollarSign,
  QrCode,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Search;
  category: "navigation" | "action" | "ai" | "recent";
  href?: string;
  action?: () => void;
  shortcut?: string;
}

const commands: CommandItem[] = [
  // Navigation
  { id: "nav-dashboard", label: "Dashboard", description: "Main overview", icon: BarChart3, category: "navigation", href: "/dashboard" },
  { id: "nav-inventory", label: "Inventory", description: "Manage donated items", icon: Package, category: "navigation", href: "/dashboard/inventory" },
  { id: "nav-requests", label: "Help Requests", description: "View & triage requests", icon: MessageSquare, category: "navigation", href: "/dashboard/requests" },
  { id: "nav-arrivals", label: "New Arrivals", description: "Registration & verification", icon: UserPlus, category: "navigation", href: "/dashboard/arrivals" },
  { id: "nav-distributions", label: "Distributions", description: "Care packages & QR tracking", icon: Truck, category: "navigation", href: "/dashboard/distributions" },
  { id: "nav-volunteers", label: "Volunteers", description: "Shift management", icon: Users, category: "navigation", href: "/dashboard/volunteers" },
  { id: "nav-finance", label: "Finance", description: "Cash donations & procurement", icon: DollarSign, category: "navigation", href: "/dashboard/finance" },
  { id: "nav-analytics", label: "Analytics", description: "Charts & burn rates", icon: BarChart3, category: "navigation", href: "/dashboard/analytics" },
  { id: "nav-ai", label: "AI Command Center", description: "Insights hub", icon: Brain, category: "navigation", href: "/dashboard/ai" },
  { id: "nav-fraud", label: "Fraud Alerts", description: "AI anomaly detection", icon: ShieldAlert, category: "navigation", href: "/dashboard/ai/fraud" },
  { id: "nav-routes", label: "Route Optimizer", description: "Delivery route planning", icon: Map, category: "navigation", href: "/dashboard/ai/routes" },
  { id: "nav-reports", label: "Impact Reports", description: "AI-generated narratives", icon: FileText, category: "navigation", href: "/dashboard/ai/reports" },
  { id: "nav-donate", label: "Donor Portal", description: "Make or track donations", icon: Heart, category: "navigation", href: "/dashboard/donate" },
  { id: "nav-settings", label: "Settings", description: "App configuration", icon: Settings, category: "navigation", href: "/dashboard/settings" },

  // Actions
  { id: "act-new-arrival", label: "Register New Arrival", description: "Create new arrival registration", icon: UserPlus, category: "action" },
  { id: "act-new-distribution", label: "Create Distribution", description: "Assemble a care package", icon: Truck, category: "action" },
  { id: "act-generate-qr", label: "Generate QR Batch", description: "Create QR codes for packages", icon: QrCode, category: "action" },
  { id: "act-record-donation", label: "Record Donation", description: "Log a cash or in-kind donation", icon: DollarSign, category: "action" },
  { id: "act-add-volunteer", label: "Add Volunteer", description: "Register new volunteer", icon: Users, category: "action" },

  // AI
  { id: "ai-generate-report", label: "Generate Impact Report", description: "AI narrative for stakeholders", icon: Sparkles, category: "ai" },
  { id: "ai-optimize-routes", label: "Optimize Delivery Routes", description: "Re-run route optimization", icon: Map, category: "ai" },
  { id: "ai-check-anomalies", label: "Scan for Anomalies", description: "Run fraud detection", icon: ShieldAlert, category: "ai" },
  { id: "ai-predict-burnrate", label: "Predict Burn Rates", description: "Forecast inventory depletion", icon: Zap, category: "ai" },
];

export default function CommandConsole() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.includes(q)
    );
  }, [query]);

  const handleSelect = useCallback((cmd: CommandItem) => {
    setOpen(false);
    if (cmd.href) router.push(cmd.href);
    if (cmd.action) cmd.action();
  }, [router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      }
    },
    [filtered, selectedIndex, handleSelect]
  );

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll("[data-cmd-item]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  const categoryLabel: Record<string, string> = {
    recent: "Recent",
    navigation: "Pages",
    action: "Actions",
    ai: "AI Commands",
  };

  if (!open) return null;

  // Compute flat index for keyboard navigation
  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-[560px] mx-4 bg-background rounded-xl shadow-xl border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b">
          <Command className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No commands found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                  {categoryLabel[cat] || cat}
                </p>
                {items.map((cmd) => {
                  const idx = flatIndex++;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      data-cmd-item
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        selectedIndex === idx ? "bg-primary/10 text-foreground" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className={`flex items-center justify-center h-8 w-8 rounded-lg shrink-0 ${
                        cat === "ai" ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`h-4 w-4 ${cat === "ai" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{cmd.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                      </div>
                      {selectedIndex === idx && (
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↵</kbd> Select</span>
          </div>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />Powered by AI
          </span>
        </div>
      </div>
    </div>
  );
}
