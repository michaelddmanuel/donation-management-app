// ============================================================
// AI: Priority-Based Dispatcher
// Analyzes help requests using NLP to score urgency
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Fetch all pending requests that haven't been scored yet (urgency_score = 0)
  const { data: requests, error } = await supabase
    .from("help_requests")
    .select(`
      id,
      description,
      original_text,
      category,
      family_size,
      preferred_language,
      created_at,
      requester:profiles!requester_id(full_name)
    `)
    .eq("status", "pending")
    .eq("urgency_score", 0)
    .order("created_at", { ascending: true })
    .limit(20);

  if (error || !requests?.length) {
    return new Response(
      JSON.stringify({
        message: "No unscored requests found",
        processed: 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const prompt = `You are a humanitarian aid triage specialist. Analyze these help requests and assign an urgency score from 0-100.

SCORING CRITERIA:
- 90-100: CRITICAL — Immediate life/health risk (no baby formula, medical emergency, no shelter)
- 70-89: HIGH — Significant need within 24-48 hours (running out of essential supplies)
- 40-69: MODERATE — Standard need, can wait 3-7 days (routine supply request)
- 0-39: LOW — Non-urgent, nice-to-have items

FACTORS TO WEIGHT:
1. Mentions of babies, elderly, disabled, or pregnant individuals (+20)
2. Medical/health urgency keywords (+25)
3. Time-sensitive language ("running out", "last", "emergency") (+15)
4. Family size (larger = higher priority) (+2 per member over 3)
5. Category priority: baby_supplies > medical > food > hygiene > clothing > other

REQUESTS TO ANALYZE:
${requests
  .map(
    (r: any, i: number) =>
      `[${i}] ID: ${r.id}
  Description: "${r.description}"
  Category: ${r.category}
  Family Size: ${r.family_size}
  Language: ${r.preferred_language}
  Submitted: ${r.created_at}`
  )
  .join("\n\n")}

Return a JSON array with objects for each request:
[
  {
    "id": "request-uuid",
    "urgency_score": 85,
    "reasoning": "Brief explanation of score",
    "priority_factors": ["baby formula mentioned", "family of 5"],
    "recommended_category": "baby_supplies",
    "translated_summary": "English summary if original was non-English"
  }
]

Return ONLY valid JSON, no markdown.`;

  try {
    const geminiResponse = await fetch(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const geminiResult = await geminiResponse.json();
    const aiText =
      geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const scoredRequests = JSON.parse(aiText.replace(/```json\n?|\n?```/g, ""));

    // Update each request in the database
    const updates = [];
    for (const scored of scoredRequests) {
      // Clamp score to valid range
      const clampedScore = Math.max(0, Math.min(100, scored.urgency_score));

      const { error: updateError } = await supabase
        .from("help_requests")
        .update({
          urgency_score: clampedScore,
          translated_text: scored.translated_summary || null,
        })
        .eq("id", scored.id);

      if (!updateError) {
        updates.push({
          id: scored.id,
          score: clampedScore,
          reasoning: scored.reasoning,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: updates.length,
        results: updates,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Priority scoring failed", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
