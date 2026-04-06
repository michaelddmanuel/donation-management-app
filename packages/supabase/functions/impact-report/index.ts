// ============================================================
// AI: Impact Story Generator
// Generates monthly impact reports for donors/stakeholders
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { year, month, chapter_id } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get impact data from our analytics function
  const { data: impactData, error } = await supabase.rpc("get_monthly_impact", {
    p_year: year || new Date().getFullYear(),
    p_month: month || new Date().getMonth() + 1,
    p_chapter_id: chapter_id || null,
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch impact data", details: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const prompt = `You are a professional nonprofit communications writer. Generate a compelling monthly impact report based on this data.

DATA:
${JSON.stringify(impactData, null, 2)}

Write a Markdown report with these sections:
1. **Executive Summary** — 2-3 sentence overview with key highlight
2. **Impact by the Numbers** — Formatted stats grid
3. **Where Your Donations Went** — Breakdown by category with percentages
4. **Volunteer Spotlight** — Acknowledge volunteer hours and dedication
5. **Looking Ahead** — Brief forward-looking statement

TONE: Warm, professional, donor-friendly. Use concrete numbers. Make donors feel their contribution matters.
FORMAT: Clean Markdown with headers, bullet points, and bold text for key figures.
LENGTH: 400-600 words.`;

  try {
    const geminiResponse = await fetch(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      }
    );

    const geminiResult = await geminiResponse.json();
    const reportMarkdown =
      geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Store the report
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const { data: report } = await supabase
      .from("impact_reports")
      .insert({
        chapter_id: chapter_id || null,
        report_period_start: startDate,
        report_period_end: endDate,
        generated_markdown: reportMarkdown,
        stats: impactData,
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        report_id: report?.id,
        markdown: reportMarkdown,
        stats: impactData,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Report generation failed", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
