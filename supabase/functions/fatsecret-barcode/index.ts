const endpoint = "https://platform.fatsecret.com/rest/food/barcode/find-by-id/v2";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};
const respond = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers });
const encode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g,
  (char) => "%" + char.charCodeAt(0).toString(16).toUpperCase());

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return respond(405, { error: "Method not allowed" });
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization?.startsWith("Bearer ")) return respond(401, { error: "Sign in required" });
    const userResponse = await fetch(Deno.env.get("SUPABASE_URL") + "/auth/v1/user", {
      headers: { authorization, apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "" },
      signal: AbortSignal.timeout(4000),
    });
    if (!userResponse.ok || !(await userResponse.json()).id) {
      return respond(401, { error: "Sign in required" });
    }

    const body = await request.json().catch(() => null);
    const barcode = body?.barcode;
    if (typeof barcode !== "string" || !/^\d{13}$/.test(barcode) ||
        [...barcode].reduce((sum, digit, index) => sum + Number(digit) * (index % 2 ? 3 : 1), 0) % 10 !== 0) {
      return respond(400, { error: "Invalid GTIN-13" });
    }
    const consumerKey = Deno.env.get("FATSECRET_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("FATSECRET_CONSUMER_SECRET");
    if (!consumerKey || !consumerSecret) return respond(503, { error: "Lookup unavailable" });
    const params = new URLSearchParams({
      barcode, format: "json",
      oauth_consumer_key: consumerKey,
      oauth_nonce: crypto.randomUUID(),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: String(Math.floor(Date.now() / 1000)),
      oauth_version: "1.0",
    });
    params.sort();
    const normalized = [...params].map(([key, value]) => encode(key) + "=" + encode(value)).join("&");
    const bytes = new TextEncoder();
    const signingKey = await crypto.subtle.importKey("raw", bytes.encode(encode(consumerSecret) + "&"),
      { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", signingKey,
      bytes.encode("GET&" + encode(endpoint) + "&" + encode(normalized)));
    params.set("oauth_signature", btoa(String.fromCharCode(...new Uint8Array(signature))));
    const upstream = await fetch(endpoint + "?" + params, {
      signal: AbortSignal.timeout(6000),
      redirect: "error",
    });
    if (!upstream.ok) return respond(502, { error: "Lookup unavailable" });
    const data = await upstream.json();
    if (String(data.error?.code) === "211") return respond(404, { error: "Product not found" });
    if (!data.food || data.error) return respond(502, { error: "Lookup unavailable" });
    const food = data.food;
    const servings = food.servings?.serving;
    const entries = Array.isArray(servings) ? servings : servings ? [servings] : [];
    return respond(200, { food: { food_name: food.food_name, brand_name: food.brand_name,
      servings: { serving: entries.map(({ metric_serving_amount, metric_serving_unit, calories,
        protein, carbohydrate, fat }) => ({ metric_serving_amount, metric_serving_unit, calories,
        protein, carbohydrate, fat })) } } });
  } catch {
    return respond(502, { error: "Lookup unavailable" });
  }
});
