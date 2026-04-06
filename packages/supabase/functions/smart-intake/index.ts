// ============================================================
// AI: Smart Intake Engine — Donation Photo → SKU + FMV + Condition
// Supabase Edge Function using Google Gemini 1.5 Pro
// ============================================================
// Trigger: Volunteer uploads a photo of a donation item via mobile app
// Output: Auto-generated SKU, condition grade, FMV estimate, catalog match

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

interface IntakeRequest {
  image_url: string;
  chapter_id: string;
  uploaded_by: string; // profile id
}

interface AIIntakeResult {
  item_name: string;
  category: string;
  condition: "new" | "good" | "fair" | "poor";
  estimated_fmv: number;
  suggested_sku: string;
  catalog_match: {
    vendor: string;
    product_name: string;
    msrp: number;
    url: string;
  } | null;
  detected_items: Array<{
    name: string;
    confidence: number;
    quantity: number;
  }>;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { image_url, chapter_id, uploaded_by }: IntakeRequest = await req.json();

  if (!image_url || !chapter_id) {
    return new Response(
      JSON.stringify({ error: "image_url and chapter_id are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const startTime = Date.now();

  // Step 1: Call Gemini Vision to analyze the donation photo
  const prompt = `You are an expert donation intake analyst for a nonprofit organization. 
Analyze this image of a donated item and provide a structured assessment.

Return a JSON object with these exact fields:
{
  "item_name": "Specific name of the item (e.g., 'Huggies Little Movers Diapers Size 4')",
  "category": "One of: food, clothing, hygiene, baby_supplies, household, medical, electronics, furniture, school_supplies, other",
  "condition": "One of: new (sealed/tags on), good (minimal wear), fair (visible wear), poor (damaged/stained)",
  "estimated_fmv": <number — Fair Market Value in USD based on condition>,
  "suggested_sku_suffix": "SHORT-CODE like 'DIAP-HUG-4' based on item type",
  "brand": "Brand name if visible, otherwise null",
  "quantity_visible": <number of this item visible in the photo>,
  "catalog_match": {
    "vendor": "Amazon or Walmart (best guess)",
    "product_name": "Full product listing name",
    "msrp": <estimated retail price in USD>,
    "search_query": "Search query to find this on the vendor site"
  },
  "detected_items": [
    {"name": "item name", "confidence": 0.95, "quantity": 1}
  ],
  "notes": "Any additional observations (expiry visible, damage details, etc.)"
}

Be precise. For FMV, use IRS Publication 561 guidelines: 
- New/sealed: 60-80% of MSRP
- Good condition: 30-50% of MSRP  
- Fair condition: 15-30% of MSRP
- Poor condition: 5-15% of MSRP

Return ONLY valid JSON, no markdown or code blocks.`;

  try {
    // Fetch the image and convert to base64
    const imageResponse = await fetch(image_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );

    const geminiResponse = await fetch(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const geminiResult = await geminiResponse.json();
    const aiText =
      geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Parse the AI response
    const aiData = JSON.parse(aiText.replace(/```json\n?|\n?```/g, ""));

    const processingTime = Date.now() - startTime;

    // Step 2: Generate full SKU
    // Format: {STATE_CODE}-{CATEGORY_PREFIX}-{ITEM_CODE}-{SEQUENCE}
    const { data: chapter } = await supabase
      .from("chapters")
      .select("state_code")
      .eq("id", chapter_id)
      .single();

    const stateCode = chapter?.state_code || "XX";
    const categoryPrefix = aiData.category
      ?.toUpperCase()
      .substring(0, 4) || "OTHR";
    const itemCode = aiData.suggested_sku_suffix || "ITEM";
    const sku = `${stateCode}-${categoryPrefix}-${itemCode}`;

    // Step 3: Check if a similar item already exists in inventory
    const { data: existingItems } = await supabase
      .from("inventory")
      .select("id, sku, name, quantity")
      .eq("chapter_id", chapter_id)
      .ilike("name", `%${aiData.item_name?.split(" ").slice(0, 2).join("%")}%`)
      .limit(3);

    // Step 4: Log the AI intake
    const { data: intakeLog } = await supabase
      .from("ai_intake_logs")
      .insert({
        raw_image_url: image_url,
        detected_items: aiData.detected_items || [],
        detected_condition: aiData.condition,
        estimated_fmv: aiData.estimated_fmv,
        suggested_sku: sku,
        catalog_match: aiData.catalog_match,
        model_version: "gemini-1.5-pro",
        processing_time_ms: processingTime,
      })
      .select()
      .single();

    // Step 5: Check market prices cache
    if (aiData.catalog_match?.msrp) {
      await supabase.from("market_prices").upsert(
        {
          item_name: aiData.item_name,
          detected_price: aiData.catalog_match.msrp,
          source_vendor: aiData.catalog_match.vendor,
          product_url: null,
        },
        { onConflict: "item_name" }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        intake: {
          item_name: aiData.item_name,
          category: aiData.category,
          condition: aiData.condition,
          estimated_fmv: aiData.estimated_fmv,
          suggested_sku: sku,
          catalog_match: aiData.catalog_match,
          detected_items: aiData.detected_items,
          notes: aiData.notes,
        },
        existing_matches: existingItems || [],
        intake_log_id: intakeLog?.id,
        processing_time_ms: processingTime,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "AI processing failed", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
