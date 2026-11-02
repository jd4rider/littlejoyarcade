// Register a game subdomain at GoDaddy on behalf of a signed-in arcade admin.
//
// The GoDaddy personal access token is a server-side secret. It must never be
// shipped to the browser, so the admin UI calls this function instead of GoDaddy
// directly:
//
//   supabase secrets set GODADDY_PAT=gd_pat_...
//   supabase functions deploy register-subdomain
//
//   await supabase.functions.invoke('register-subdomain', {
//     body: { game: 'star-trail', target: 'jd4rider.github.io' },
//   })
//
// Authorisation: the caller's JWT is verified with the anon client, then their
// profile row is read as that user. Only role = 'admin' may change DNS, and the
// check runs in Postgres/RLS rather than trusting the client.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const DOMAIN = Deno.env.get('ARCADE_DOMAIN') ?? 'littlejoyarcade.site'
const TTL = 600
const GAME_ID = /^[a-z0-9][a-z0-9-]{1,38}$/

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authorization = request.headers.get('Authorization') ?? ''
  const token = authorization.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Sign in required' }, 401)

  const url = Deno.env.get('SUPABASE_URL')
  const anon = Deno.env.get('SUPABASE_ANON_KEY')
  const godaddy = Deno.env.get('GODADDY_PAT')
  if (!url || !anon) return json({ error: 'Function is not configured' }, 500)
  if (!godaddy) return json({ error: 'GODADDY_PAT secret is not set' }, 500)

  const supabase = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) return json({ error: 'Invalid session' }, 401)

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userData.user.id).maybeSingle()
  if (profile?.role !== 'admin') return json({ error: 'Admin role required' }, 403)

  let body: { game?: string; target?: string; repo?: string }
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Expected a JSON body' }, 400)
  }

  const game = String(body.game ?? '')
  const target = String(body.target ?? 'jd4rider.github.io')
  if (!GAME_ID.test(game)) return json({ error: 'Invalid game id' }, 400)
  if (!/^[a-z0-9.-]+$/i.test(target)) return json({ error: 'Invalid target host' }, 400)

  const host = `${game}.${DOMAIN}`
  const response = await fetch(
    `https://api.godaddy.com/v1/domains/${DOMAIN}/records/CNAME/${encodeURIComponent(game)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${godaddy}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify([{ data: target, ttl: TTL }]),
    },
  )

  if (!response.ok) {
    const detail = await response.text()
    return json({ error: `GoDaddy rejected the record (HTTP ${response.status})`, detail }, 502)
  }

  return json({ host, target, ttl: TTL, note: 'DNS can take a few minutes to resolve everywhere.' })
})
