import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Require admin header to avoid exposing service role on public GET
    const expectedKey = process.env.ADMIN_INTROSPECT_KEY
    const provided = request.headers.get("x-admin-introspect-key") || request.headers.get("authorization")
    if (!expectedKey || !provided) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = provided.startsWith("Bearer ") ? provided.slice(7) : provided
    if (token !== expectedKey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment" }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const tables = [
      "profiles",
      "properties",
      "bookings",
      "reviews",
      "saved_properties",
      "notifications",
    ] as const

    const checks = await Promise.all(
      tables.map(async (t) => {
        const { error } = await supabase.from(t).select("*", { count: "exact", head: true })
        return { table: t, ok: !error, error }
      }),
    )

    return NextResponse.json({ ok: checks.every((c) => c.ok), checks })
  } catch (err) {
    return NextResponse.json({ error: "Unexpected error", detail: String(err) }, { status: 500 })
  }
}
