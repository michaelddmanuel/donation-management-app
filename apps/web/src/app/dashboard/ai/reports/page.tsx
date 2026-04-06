"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Eye,
  Sparkles,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  title: string;
  chapter: string | null;
  period: string;
  status: "generating" | "ready" | "draft";
  families_served: number;
  items_distributed: number;
  total_fmv: number;
  generated_at: string;
  summary: string;
}

const mockReports: Report[] = [
  { id: "1", title: "March 2026 Impact Report — All Chapters", chapter: null, period: "March 2026", status: "ready", families_served: 1089, items_distributed: 4312, total_fmv: 37500, generated_at: "April 1, 2026", summary: "In March 2026, DonationHub served 1,089 families across 12 state chapters — a 12% increase from February. Texas led distributions with 342 care packages delivered, followed by California at 289. Our AI-powered intake system processed 847 donation items, maintaining a 98.2% accuracy rate on FMV estimates. Three fraud anomalies were detected and mitigated, saving an estimated $3,200." },
  { id: "2", title: "Q1 2026 Impact Report — Texas", chapter: "Texas", period: "Q1 2026", status: "ready", families_served: 342, items_distributed: 1456, total_fmv: 12800, generated_at: "April 2, 2026", summary: "The Texas chapter served 342 families in Q1 2026, up 18% quarter-over-quarter. Key highlights include the launch of the Spanish-language WhatsApp intake bot, which processed 127 help requests directly from families. Diaper and baby supply burn rates remain the highest priority — AI predictive procurement saved $890 by buying diapers at optimal pricing from Sam's Club." },
  { id: "3", title: "March 2026 Impact Report — California", chapter: "California", period: "March 2026", status: "ready", families_served: 289, items_distributed: 1189, total_fmv: 9400, generated_at: "April 1, 2026", summary: "California served 289 families in March, with a strong focus on newly arrived families from Afghanistan. The AI matchmaker automatically assembled 45 culturally-appropriate Welcome Kits, including Halal food items. Volunteer hours increased 22% thanks to the mobile check-in system." },
  { id: "4", title: "April 2026 Impact Report (In Progress)", chapter: null, period: "April 2026", status: "generating", families_served: 89, items_distributed: 367, total_fmv: 4150, generated_at: "In progress...", summary: "" },
];

export default function ReportsPage() {
  const [chapterFilter, setChapterFilter] = useState("all");

  const filtered = chapterFilter === "all" ? mockReports : mockReports.filter((r) => r.chapter === chapterFilter || r.chapter === null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display-xs font-bold text-foreground flex items-center gap-2">
            <FileText className="h-7 w-7 text-emerald-600" />
            Impact Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated narrative reports for donors and stakeholders
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={chapterFilter} onValueChange={setChapterFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chapters</SelectItem>
              <SelectItem value="Texas">Texas</SelectItem>
              <SelectItem value="California">California</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />Generate Report
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((report) => (
          <Card key={report.id} className={report.status === "generating" ? "border-primary/30 bg-primary/5" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-foreground">{report.title}</h3>
                    {report.status === "generating" ? (
                      <Badge className="gap-1 bg-primary/20 text-primary border-primary/30 text-[10px]"><RefreshCw className="h-3 w-3 animate-spin" />Generating...</Badge>
                    ) : report.status === "ready" ? (
                      <Badge variant="success" className="text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" />Ready</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Draft</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{report.period}</span>
                    <span>{report.families_served} families</span>
                    <span>{report.items_distributed.toLocaleString()} items</span>
                    <span>${report.total_fmv.toLocaleString()} FMV</span>
                  </div>
                  {report.summary && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3">{report.summary}</p>
                  )}
                </div>
                {report.status === "ready" && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {report.status === "ready" && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />Generated by Gemini 1.5 Pro · {report.generated_at}
                  </span>
                  <Button variant="outline" size="sm" className="h-7 text-xs ml-auto">Share with Donors</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
