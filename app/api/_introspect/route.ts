import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Try a lightweight check on the "properties" table
    const { data, error, status } = await supabase.from('properties').select('id').limit(1)

    if (error) {
      return NextResponse.json({ error: 'Query error', detail: error, status }, { status: 500 })
    }

    return NextResponse.json({ ok: true, sample: data })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', detail: String(err) }, { status: 500 })
  }
}
