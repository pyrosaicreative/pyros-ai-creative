const allowedOrigins = new Set(['https://pyrosaicreative.com', 'https://www.pyrosaicreative.com']);

export async function handleRequest(request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  };
  if (origin && !allowedOrigins.has(origin)) {
    return Response.json({ error: 'Origin not allowed' }, { status: 403, headers });
  }
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  const reply = (status, body) => Response.json(body, { status, headers });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' });

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return reply(401, { error: 'Sign in required' });
  try {
    const body = await request.json();
    if (body?.confirmation !== 'DELETE') return reply(400, { error: 'Confirmation required' });
  } catch {
    return reply(400, { error: 'Invalid request' });
  }

  const url = globalThis.Deno.env.get('SUPABASE_URL');
  const anonKey = globalThis.Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = globalThis.Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anonKey || !serviceKey) return reply(500, { error: 'Service unavailable' });

  try {
    // Verify with Auth, rather than trusting a decoded JWT or a client-supplied user ID.
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: authorization },
    });
    if (!userResponse.ok) return reply(401, { error: 'Sign in required' });
    const user = await userResponse.json();
    if (!user.id || user.is_anonymous) return reply(401, { error: 'Sign in required' });

    // Revoke refresh tokens for all sessions before deleting the verified user.
    const logout = await fetch(`${url}/auth/v1/logout?scope=global`, {
      method: 'POST',
      headers: { apikey: serviceKey, Authorization: authorization },
    });
    if (!logout.ok) return reply(500, { error: 'Unable to revoke sessions' });

    const deletion = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    // guide_downloads.user_id already uses ON DELETE CASCADE.
    if (!deletion.ok) return reply(500, { error: 'Unable to delete account' });
    return reply(200, { success: true });
  } catch {
    return reply(500, { error: 'Service unavailable' });
  }
}

if (globalThis.Deno) globalThis.Deno.serve(handleRequest);
