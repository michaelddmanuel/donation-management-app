"use client";

import { useState } from "react";
import {
  Heart,
  DollarSign,
  Package,
  TrendingUp,
  Receipt,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Users,
  Gift,
  Sparkles,
  ArrowUpRight,
  Eye,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ── Types ── */

interface Donation {
  id: string;
  type: "monetary" | "in_kind" | "sponsorship";
  amount: number | null;
  description: string;
  chapter: string | null;
  recurring: boolean;
  frequency: string | null;
  status: "completed" | "pending" | "processing";
  date: string;
  tax_receipt: boolean;
}

interface ImpactMetric {
  label: string;
  value: string;
  icon: typeof Heart;
  change: string;
}

/* ── Mock data ── */

const mockDonations: Donation[] = [
  { id: "1", type: "monetary", amount: 500, description: "Monthly recurring donation", chapter: "Texas", recurring: true, frequency: "monthly", status: "completed", date: "2026-04-01", tax_receipt: true },
  { id: "2", type: "in_kind", amount: 245, description: "20 winter coats (used — good condition)", chapter: "Illinois", recurring: false, frequency: null, status: "completed", date: "2026-03-28", tax_receipt: true },
  { id: "3", type: "monetary", amount: 100, description: "One-time donation via portal", chapter: null, recurring: false, frequency: null, status: "completed", date: "2026-03-15", tax_receipt: true },
  { id: "4", type: "sponsorship", amount: 1200, description: "Annual family sponsorship — Garcia family", chapter: "Texas", recurring: true, frequency: "annual", status: "completed", date: "2026-01-15", tax_receipt: true },
  { id: "5", type: "monetary", amount: 50, description: "Monthly recurring donation", chapter: "California", recurring: true, frequency: "monthly", status: "processing", date: "2026-04-05", tax_receipt: false },
  { id: "6", type: "in_kind", amount: 87, description: "10 backpacks with school supplies", chapter: "New York", recurring: false, frequency: null, status: "completed", date: "2026-02-20", tax_receipt: true },
];

function typeBadge(type: string) {
  switch (type) {
    case "monetary": return <Badge variant="success" className="gap-1 text-[10px]"><DollarSign className="h-3 w-3" />Cash</Badge>;
    case "in_kind": return <Badge variant="warning" className="gap-1 text-[10px]"><Package className="h-3 w-3" />In-Kind</Badge>;
    case "sponsorship": return <Badge className="gap-1 text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200"><Heart className="h-3 w-3" />Sponsorship</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
}

/* ── Donate Modal ── */

function DonateForm({ onClose }: { onClose: () => void }) {
  const [donationType, setDonationType] = useState("monetary");
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />Make a Donation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Donation Type</label>
            <Select value={donationType} onValueChange={setDonationType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monetary">Cash / Card</SelectItem>
                <SelectItem value="in_kind">In-Kind (Items)</SelectItem>
                <SelectItem value="sponsorship">Family Sponsorship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {donationType === "monetary" && (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["25", "50", "100", "250"].map((v) => (
                    <Button key={v} variant={amount === v ? "default" : "outline"} size="sm" onClick={() => setAmount(v)}>${v}</Button>
                  ))}
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Custom amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-8" type="number" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setRecurring(!recurring)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${recurring ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${recurring ? "translate-x-4" : "translate-x-0"}`} />
                </button>
                <span className="text-sm">Make this monthly</span>
              </div>
            </>
          )}

          {donationType === "in_kind" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Describe Items</label>
              <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none" placeholder="e.g., 10 winter coats in good condition, 5 boxes of diapers (size 3)..." />
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />Our AI will estimate the Fair Market Value for your tax receipt
              </p>
            </div>
          )}

          {donationType === "sponsorship" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sponsor a family for $100/month. You&apos;ll receive quarterly impact reports showing exactly how your sponsorship helps.
              </p>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-foreground">AI-Matched Family</p>
                <p className="text-xs text-muted-foreground mt-1">We&apos;ll match you with a family whose needs best align with your support level.</p>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Direct to Chapter (optional)</label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Any chapter in need" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any chapter in need</SelectItem>
                <SelectItem value="texas">Texas</SelectItem>
                <SelectItem value="california">California</SelectItem>
                <SelectItem value="new_york">New York</SelectItem>
                <SelectItem value="florida">Florida</SelectItem>
                <SelectItem value="illinois">Illinois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 gap-2">
              <Heart className="h-4 w-4" />
              {donationType === "monetary" ? `Donate${amount ? ` $${amount}` : ""}` : donationType === "in_kind" ? "Schedule Pickup" : "Sponsor a Family"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Main Page ── */

export default function DonorPortalPage() {
  const [showDonateForm, setShowDonateForm] = useState(false);
  const totalDonated = mockDonations.filter((d) => d.status === "completed").reduce((s, d) => s + (d.amount ?? 0), 0);
  const taxDeductible = mockDonations.filter((d) => d.tax_receipt).reduce((s, d) => s + (d.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {showDonateForm && <DonateForm onClose={() => setShowDonateForm(false)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" />
            Donor Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everyone can give. Track your impact and manage donations.
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowDonateForm(true)}>
          <Plus className="h-4 w-4" />Make a Donation
        </Button>
      </div>

      {/* Impact stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalDonated.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Donated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">23</p>
              <p className="text-xs text-muted-foreground">Families Helped</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <Receipt className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${taxDeductible.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Tax Deductible</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockDonations.length}</p>
              <p className="text-xs text-muted-foreground">Donations Made</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Impact Story */}
      <Card className="bg-gradient-to-r from-primary/5 via-emerald-500/5 to-blue-500/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Your Impact Story</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Your donations have supported <strong className="text-foreground">23 families</strong> across <strong className="text-foreground">4 state chapters</strong>.
                In March alone, your $500 recurring donation helped provide Welcome Kits to 3 newly arrived families in Texas.
                Your sponsored family, the Garcias, reported their children are thriving in school — Maria earned honor roll this quarter.
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />Generated by AI based on your donation history and outcomes data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donation History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Donation History</CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Download className="h-3 w-3" />Tax Summary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDonations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${donation.type === "monetary" ? "bg-emerald-50 dark:bg-emerald-500/10" : donation.type === "sponsorship" ? "bg-purple-50 dark:bg-purple-500/10" : "bg-amber-50 dark:bg-amber-500/10"}`}>
                    {donation.type === "monetary" ? <DollarSign className="h-4 w-4 text-emerald-600" /> :
                     donation.type === "sponsorship" ? <Heart className="h-4 w-4 text-purple-600" /> :
                     <Package className="h-4 w-4 text-amber-600" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{donation.description}</p>
                      {donation.recurring && <Badge variant="secondary" className="text-[9px] h-4"><RefreshCw className="h-2.5 w-2.5 mr-0.5" />{donation.frequency}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{donation.date}</span>
                      {donation.chapter && <span className="text-[10px] text-muted-foreground">· {donation.chapter}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {typeBadge(donation.type)}
                  <span className="text-sm font-medium text-foreground">{donation.amount ? `$${donation.amount.toLocaleString()}` : "—"}</span>
                  {donation.tax_receipt && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Download tax receipt">
                      <Receipt className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
