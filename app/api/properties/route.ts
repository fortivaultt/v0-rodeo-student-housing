import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const city = searchParams.get("city")
    const propertyType = searchParams.get("type")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase
      .from("properties")
      .select(`
        *,
        profiles:landlord_id (
          full_name,
          profile_image_url
        )
      `)
      .eq("is_active", true)
      .eq("verification_status", "verified")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (city) {
      query = query.ilike("city", `%${city}%`)
    }

    if (propertyType && propertyType !== "all") {
      query = query.eq("property_type", propertyType)
    }

    if (minPrice) {
      query = query.gte("price_per_month", Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte("price_per_month", Number.parseFloat(maxPrice))
    }

    const { data: properties, error } = await query

    if (error) {
      console.error("Error fetching properties:", error)
      return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
    }

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Error in properties API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: property, error } = await supabase
      .from("properties")
      .insert([
        {
          ...body,
          landlord_id: user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating property:", error)
      return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
    }

    return NextResponse.json({ property }, { status: 201 })
  } catch (error) {
    console.error("Error in property creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
