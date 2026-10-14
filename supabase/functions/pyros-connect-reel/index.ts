import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const INSTAGRAM_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN") ?? "";
const ACCOUNT_ID = "17841442108763011";
const API_VERSION = "v26.0";

function corsHeaders(origin: string | null): HeadersInit {
  const local = origin ? /^http:\/\/(localhost|127\.0\.0\.1):43\d{2}$/.test(origin) : false;
  const production = origin === "https://pyrosaicreative.com" || origin === "https://www.pyrosaicreative.com";
  return {
    ...(origin && (local || production) ? { "Access-Control-Allow-Origin": origin } : {}),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

function respond(data: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}

function shortcodeFromUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 500) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !["www.instagram.com", "instagram.com"].includes(url.hostname.toLowerCase())) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 2 || !["p", "reel", "tv"].includes(parts[0])) return null;
    return /^[a-zA-Z0-9_-]{5,30}$/.test(parts[1]) ? parts[1] : null;
  } catch {
    return null;
  }
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("Origin");

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405, origin);
  }

  if (!SUPABASE_URL || !SERVICE_KEY || !INSTAGRAM_TOKEN) {
    console.error("PYROS Connect Reel lookup: missing server configuration");
    return respond({ error: "Reel lookup is not configured" }, 503, origin);
  }

  const jwt = request.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!jwt) return respond({ error: "Sign in required" }, 401, origin);

  const database = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: auth, error: authError } = await database.auth.getUser(jwt);
  if (authError || !auth.user) return respond({ error: "Invalid session" }, 401, origin);

  const { data: admin, error: adminError } = await database
    .from("pyros_connect_admins")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (adminError) {
    console.error("PYROS Connect Reel lookup: admin check failed", adminError.code);
    return respond({ error: "Administrator check failed" }, 503, origin);
  }
  if (!admin) return respond({ error: "Administrator access required" }, 403, origin);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return respond({ error: "Invalid JSON" }, 400, origin);
  }

  const url = typeof payload === "object" && payload !== null && "url" in payload
    ? (payload as { url: unknown }).url
    : null;

  const shortcode = shortcodeFromUrl(url);
  if (!shortcode) return respond({ error: "Paste a valid Instagram Reel link" }, 400, origin);

  let after: string | null = null;
  const usedCursors = new Set<string>();

  try {
    for (let page = 0; page < 12; page++) {
      const endpoint = new URL(`https://graph.instagram.com/${API_VERSION}/${ACCOUNT_ID}/media`);
      endpoint.searchParams.set("fields", "id,permalink,media_type");
      endpoint.searchParams.set("limit", "100");
      if (after) endpoint.searchParams.set("after", after);

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${INSTAGRAM_TOKEN}` },
        signal: AbortSignal.timeout(12000),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.error) {
        const code = result?.error?.code ?? response.status;
        console.error("PYROS Connect Reel lookup: Instagram API error", code);
        return respond({ error: `Instagram API request failed (code ${code}); check token permissions.` }, 502, origin);
      }
      const items = Array.isArray(result?.data) ? result.data : [];
      for (const item of items) {
        if (shortcodeFromUrl(item?.permalink) === shortcode && typeof item?.id === "string") {
          return respond({ reel_id: item.id, permalink: item.permalink }, 200, origin);
        }
      }

      const cursor = result?.paging?.cursors?.after;
      if (typeof cursor !== "string" || !cursor || usedCursors.has(cursor)) break;
      usedCursors.add(cursor);
      after = cursor;
    }
    return respond({
      error: "Reel not found among recent posts of @pyrosaicreative. Check that it belongs to this account.",
    }, 404, origin);
  } catch (error) {
    console.error("PYROS Connect Reel lookup: request failed", error instanceof Error ? error.name : "unknown");
    return respond({ error: "Could not contact Instagram. Try again." }, 502, origin);
  }
});
