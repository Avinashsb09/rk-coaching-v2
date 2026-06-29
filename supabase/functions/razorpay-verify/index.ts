// Supabase Edge Function: razorpay-verify
// Securely verifies the Razorpay signature and unlocks course content in Supabase

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
    const { orderId, paymentId, signature, courseId, userId, amount } = await req.json();

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      throw new Error("Razorpay Key Secret is not configured on the server.");
    }

    // Verify the signature
    const text = `${orderId}|${paymentId}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(keySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(text)
    );
    const calculatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (calculatedSignature !== signature) {
      throw new Error("Payment signature verification failed. Possible fraud attempt.");
    }

    // Signature verified! Now insert into database using service role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are missing on the server.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Insert/Upsert enrollment
    const { error: enrollErr } = await supabase.from("enrollments").upsert({
      userId,
      courseId
    }, { onConflict: "userId,courseId" });

    if (enrollErr) throw enrollErr;

    // 2. Insert order
    const { error: orderErr } = await supabase.from("orders").insert({
      id: orderId,
      userId,
      courseId,
      amount,
      status: "completed"
    });

    if (orderErr) throw orderErr;

    // 3. Insert payment
    const { error: payErr } = await supabase.from("payments").insert({
      id: paymentId,
      orderId,
      userId,
      amount,
      method: "Razorpay Checkout",
      status: "success"
    });

    if (payErr) throw payErr;

    return new Response(JSON.stringify({ success: true, message: "Payment verified and course unlocked!" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
