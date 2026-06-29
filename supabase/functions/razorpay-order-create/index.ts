// Supabase Edge Function: razorpay-order-create
// Securely creates a real Razorpay Order on the server side

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, courseId, userId } = await req.json();

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials are not configured on the server.");
    }

    // Razorpay order creation payload
    // amount is in paise
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(`${keyId}:${keySecret}`)}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_u${userId}_c${courseId}`.substring(0, 40)
      })
    });

    const orderData = await response.json();

    if (!response.ok) {
      throw new Error(orderData.error?.description || "Failed to create Razorpay order");
    }

    return new Response(JSON.stringify(orderData), {
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
