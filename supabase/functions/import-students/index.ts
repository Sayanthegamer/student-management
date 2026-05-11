import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get current user's JWT from headers to verify they are authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse body only after checking auth header exists
    const { students, fees } = await req.json()

    // Validate payload
    if (!Array.isArray(students) || !Array.isArray(fees)) {
      return new Response(JSON.stringify({ error: 'Bad Request: students and fees must be arrays' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is logged in
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      if (authError) console.error('Auth Error:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // RBAC: Only allow users with 'admin' role in app_metadata to trigger full replace.
    // user_metadata is user-controllable and insecure for privilege checks.
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      console.warn(`Unauthorized attempt to call full_replace_import by user: ${user.id}`);
      return new Response(JSON.stringify({ error: 'Forbidden: Admin privileges required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Use service role to call the RPC, passing the user.id for tenant isolation
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await adminClient.rpc('full_replace_import', {
      p_user_id: user.id,
      students,
      fees
    })

    if (error) {
      console.error('RPC Error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ data }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Function Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
