import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TwilioMessage {
  From: string;        // e.g. "whatsapp:+15125550143"
  To: string;
  Body: string;
  ProfileName?: string;
  NumMedia?: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse Twilio webhook (application/x-www-form-urlencoded)
    const formData = await req.formData();
    const msg: TwilioMessage = {
      From: formData.get("From") as string,
      To: formData.get("To") as string,
      Body: formData.get("Body") as string,
      ProfileName: formData.get("ProfileName") as string | undefined,
      NumMedia: formData.get("NumMedia") as string | undefined,
      MediaUrl0: formData.get("MediaUrl0") as string | undefined,
      MediaContentType0: formData.get("MediaContentType0") as string | undefined,
    };

    const phone = msg.From.replace("whatsapp:", "");
    const source: "whatsapp" | "sms" = msg.From.startsWith("whatsapp:") ? "whatsapp" : "sms";
    const displayName = msg.ProfileName || phone;

    // 1. Find or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("phone_number", phone)
      .eq("status", "open")
      .single();

    if (!conversation) {
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          phone_number: phone,
          source,
          contact_name: displayName,
          status: "open",
        })
        .select()
        .single();
      if (error) throw error;
      conversation = newConv;
    }

    // 2. Store the message
    await supabase.from("conversation_messages").insert({
      conversation_id: conversation.id,
      direction: "inbound",
      content: msg.Body,
      media_url: msg.MediaUrl0 || null,
      media_type: msg.MediaContentType0 || null,
    });

    // 3. Use Gemini to detect language, translate, and assess intent
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    const analysisRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a donation center assistant. Analyze this incoming ${source} message and respond with JSON only.

Message: "${msg.Body}"
Sender: ${displayName}

Return EXACT JSON:
{
  "detected_language": "ISO 639-1 code",
  "english_translation": "translation if not English, otherwise the original",
  "intent": "help_request | donation_offer | status_inquiry | greeting | other",
  "urgency_score": 0-100,
  "suggested_reply_in_original_language": "a brief, warm reply in the sender's language acknowledging their message",
  "family_size_mentioned": null or number,
  "needs_mentioned": ["list of specific needs mentioned"]
}`
            }]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
        }),
      }
    );

    const geminiData = await analysisRes.json();
    const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // 4. If it's a help request, create one automatically
    if (analysis.intent === "help_request" && analysis.urgency_score > 0) {
      // Try to find or create a profile for the requester
      let { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .single();

      // Determine chapter from the Twilio number mapping (simplified — in production, use a lookup table)
      const chapterMapping: Record<string, string> = {};

      await supabase.from("help_requests").insert({
        requester_id: profile?.id || null,
        description: analysis.english_translation || msg.Body,
        original_language: analysis.detected_language || "en",
        original_text: msg.Body,
        urgency_score: analysis.urgency_score || 50,
        source,
        family_size: analysis.family_size_mentioned || null,
        needed_items: analysis.needs_mentioned || [],
        status: "pending",
      });
    }

    // 5. Send auto-reply via Twilio
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_WHATSAPP_FROM") || msg.To;

    if (twilioSid && twilioToken && analysis.suggested_reply_in_original_language) {
      const replyBody = analysis.suggested_reply_in_original_language;

      // Store outbound message
      await supabase.from("conversation_messages").insert({
        conversation_id: conversation.id,
        direction: "outbound",
        content: replyBody,
      });

      // Send via Twilio
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = btoa(`${twilioSid}:${twilioToken}`);

      await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: twilioFrom,
          To: msg.From,
          Body: replyBody,
        }).toString(),
      });
    }

    // Twilio expects TwiML or 200 OK
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  }
});
