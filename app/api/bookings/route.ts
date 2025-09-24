import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `*,
        property:property_id (id, title, city, price_per_month, currency, images, landlord_id)`,
        { count: "exact" },
      )
      .eq("tenant_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json({ bookings: data })
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { property_id, check_in_date, check_out_date, duration, guests, total_amount, payment_provider } = body

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          property_id,
          tenant_id: user.id,
          check_in_date,
          check_out_date,
          duration,
          guests,
          total_amount,
          payment_provider,
          status: "pending",
          payment_status: "unpaid",
        },
      ])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ booking: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
