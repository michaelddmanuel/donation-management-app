// ============================================================
// AI: Receipt-to-Inventory Parser
// Forwards Amazon/Walmart confirmation emails → auto-inventory
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

interface ReceiptRequest {
  email_html?: string;
  receipt_text?: string;
  receipt_image_url?: string;
  chapter_id: string;
  ordered_by: string;
  vendor: string; // "Amazon" | "Walmart" | "Other"
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body: ReceiptRequest = await req.json();

  if (!body.chapter_id || (!body.email_html && !body.receipt_text && !body.receipt_image_url)) {
    return new Response(
      JSON.stringify({ error: "chapter_id and at least one receipt source required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Build the prompt based on available input type
  let contentParts: any[] = [];

  const extractionPrompt = `You are an expert at parsing e-commerce receipts and order confirmations. 
Extract ALL line items from this receipt/order confirmation.

Return a JSON object with this structure:
{
  "vendor": "Amazon" or "Walmart" or detected vendor,
  "order_id": "Order number/ID from the receipt",
  "order_date": "YYYY-MM-DD",
  "line_items": [
    {
      "item_name": "Full product name",
      "quantity": 2,
      "unit_price": 12.99,
      "total_price": 25.98,
      "category": "One of: food, clothing, hygiene, baby_supplies, household, medical, electronics, furniture, school_supplies, other",
      "suggested_sku_suffix": "SHORT-CODE"
    }
  ],
  "subtotal": 100.00,
  "tax": 8.25,
  "shipping": 0,
  "total": 108.25
}

Be precise with amounts. Return ONLY valid JSON.`;

  if (body.receipt_image_url) {
    const imageResponse = await fetch(body.receipt_image_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );
    contentParts = [
      { text: extractionPrompt },
      { inline_data: { mime_type: "image/jpeg", data: base64Image } },
    ];
  } else {
    const textContent = body.email_html || body.receipt_text || "";
    contentParts = [
      { text: `${extractionPrompt}\n\nRECEIPT CONTENT:\n${textContent}` },
    ];
  }

  try {
    const geminiResponse = await fetch(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: contentParts }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    );

    const geminiResult = await geminiResponse.json();
    const aiText =
      geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const receiptData = JSON.parse(aiText.replace(/```json\n?|\n?```/g, ""));

    // Get chapter state code for SKU
    const { data: chapter } = await supabase
      .from("chapters")
      .select("state_code")
      .eq("id", body.chapter_id)
      .single();

    const stateCode = chapter?.state_code || "XX";

    const processedItems: any[] = [];
    const newItems: any[] = [];
    const updatedItems: any[] = [];

    for (const item of receiptData.line_items || []) {
      // Check if item exists in inventory
      const { data: existing } = await supabase
        .from("inventory")
        .select("id, sku, name, quantity")
        .eq("chapter_id", body.chapter_id)
        .ilike("name", `%${item.item_name.split(" ").slice(0, 3).join("%")}%`)
        .limit(1)
        .single();

      if (existing) {
        // Increment existing inventory
        const newQty = existing.quantity + item.quantity;
        await supabase
          .from("inventory")
          .update({ quantity: newQty })
          .eq("id", existing.id);

        updatedItems.push({
          id: existing.id,
          name: existing.name,
          previous_qty: existing.quantity,
          new_qty: newQty,
          added: item.quantity,
        });
      } else {
        // Create new inventory item
        const categoryPrefix =
          item.category?.toUpperCase().substring(0, 4) || "OTHR";
        const sku = `${stateCode}-${categoryPrefix}-${item.suggested_sku_suffix || "NEW"}`;

        const { data: newItem } = await supabase
          .from("inventory")
          .insert({
            chapter_id: body.chapter_id,
            sku,
            name: item.item_name,
            category: item.category || "other",
            quantity: item.quantity,
            fair_market_value: item.unit_price,
            condition: "new",
            source_vendor: body.vendor,
            msrp: item.unit_price,
          })
          .select()
          .single();

        newItems.push({
          id: newItem?.id,
          name: item.item_name,
          sku,
          quantity: item.quantity,
        });
      }

      processedItems.push(item);
    }

    // Create procurement record
    const { data: procurement } = await supabase
      .from("procurement")
      .insert({
        chapter_id: body.chapter_id,
        vendor: receiptData.vendor || body.vendor,
        order_id_external: receiptData.order_id,
        total_cost: receiptData.total || 0,
        status: "received",
        ordered_by: body.ordered_by,
      })
      .select()
      .single();

    // Insert procurement line items
    if (procurement) {
      await supabase.from("procurement_items").insert(
        processedItems.map((item: any) => ({
          procurement_id: procurement.id,
          item_name: item.item_name,
          sku: null,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        receipt: {
          vendor: receiptData.vendor,
          order_id: receiptData.order_id,
          total: receiptData.total,
          items_count: processedItems.length,
        },
        inventory_updates: {
          new_items: newItems,
          updated_items: updatedItems,
        },
        procurement_id: procurement?.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Receipt parsing failed", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
