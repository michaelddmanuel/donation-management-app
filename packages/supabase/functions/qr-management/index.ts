import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, ...params } = await req.json();

    switch (action) {
      // Generate QR codes for care packages
      case "generate": {
        const { care_package_id, chapter_id, count = 1 } = params;

        // Verify the care package exists
        const { data: pkg, error: pkgError } = await supabase
          .from("care_packages")
          .select("id, name")
          .eq("id", care_package_id)
          .single();

        if (pkgError || !pkg) {
          return new Response(
            JSON.stringify({ error: "Care package not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate QR records
        const qrRecords = Array.from({ length: count }, () => ({
          care_package_id,
          chapter_id,
          qr_data: crypto.randomUUID(),
          status: "generated",
        }));

        const { data: qrs, error: insertError } = await supabase
          .from("care_package_qr")
          .insert(qrRecords)
          .select();

        if (insertError) throw insertError;

        // Return the QR data — the client generates visual QR codes from these UUIDs
        const qrCodes = qrs!.map((qr: { id: string; qr_data: string }) => ({
          id: qr.id,
          qr_data: qr.qr_data,
          // URL format: https://{app_url}/verify/{qr_data}
          verify_url: `${Deno.env.get("APP_URL") || "https://app.donationhub.org"}/verify/${qr.qr_data}`,
        }));

        return new Response(
          JSON.stringify({ success: true, package_name: pkg.name, qr_codes: qrCodes }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Assign a QR code to a recipient
      case "assign": {
        const { qr_data, recipient_id } = params;

        const { data: qr, error: findError } = await supabase
          .from("care_package_qr")
          .select("*")
          .eq("qr_data", qr_data)
          .eq("status", "generated")
          .single();

        if (findError || !qr) {
          return new Response(
            JSON.stringify({ error: "QR code not found or already assigned" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await supabase
          .from("care_package_qr")
          .update({
            recipient_id,
            status: "assigned",
            assigned_at: new Date().toISOString(),
          })
          .eq("id", qr.id);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true, status: "assigned", recipient_id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Scan/verify — called when volunteer scans QR at delivery
      case "verify": {
        const { qr_data, volunteer_id, location } = params;

        const { data: qr, error: findError } = await supabase
          .from("care_package_qr")
          .select("*, care_packages(*)")
          .eq("qr_data", qr_data)
          .single();

        if (findError || !qr) {
          return new Response(
            JSON.stringify({ error: "Invalid QR code" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (qr.status === "distributed") {
          return new Response(
            JSON.stringify({
              error: "Already distributed",
              distributed_at: qr.distributed_at,
              distributed_by: qr.distributed_by,
            }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (qr.status === "void") {
          return new Response(
            JSON.stringify({ error: "QR code has been voided" }),
            { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Mark as distributed
        const { error: updateError } = await supabase
          .from("care_package_qr")
          .update({
            status: "distributed",
            distributed_at: new Date().toISOString(),
            distributed_by: volunteer_id,
          })
          .eq("id", qr.id);

        if (updateError) throw updateError;

        // Also create a distribution record
        await supabase.from("distributions").insert({
          care_package_id: qr.care_package_id,
          recipient_id: qr.recipient_id,
          distributed_by: volunteer_id,
          chapter_id: qr.chapter_id,
          location: location ? `SRID=4326;POINT(${location.lng} ${location.lat})` : null,
          status: "delivered",
        });

        return new Response(
          JSON.stringify({
            success: true,
            status: "distributed",
            package_name: qr.care_packages?.name,
            recipient_id: qr.recipient_id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Void a QR code
      case "void": {
        const { qr_data, reason } = params;

        const { error } = await supabase
          .from("care_package_qr")
          .update({ status: "void" })
          .eq("qr_data", qr_data)
          .in("status", ["generated", "assigned"]);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, status: "void" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("QR management error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
