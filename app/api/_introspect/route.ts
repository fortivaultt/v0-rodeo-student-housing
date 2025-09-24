import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
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
