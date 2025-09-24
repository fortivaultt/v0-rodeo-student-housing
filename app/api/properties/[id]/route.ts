import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: property, error } = await supabase
      .from("properties")
      .select(`
        *,
        profiles:landlord_id (
          full_name,
          profile_image_url,
          phone,
          email
        ),
        reviews (
          id,
          rating,
          title,
          comment,
          created_at,
          profiles:reviewer_id (
            full_name,
            profile_image_url
          )
        )
      `)
      .eq("id", params.id)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error fetching property:", error)
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error in property detail API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      .update(body)
      .eq("id", params.id)
      .eq("landlord_id", user.id) // Ensure user can only update their own properties
      .select()
      .single()

    if (error) {
      console.error("Error updating property:", error)
      return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error("Error in property update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await supabase
      .from("properties")
      .update({ is_active: false })
      .eq("id", params.id)
      .eq("landlord_id", user.id) // Ensure user can only delete their own properties

    if (error) {
      console.error("Error deleting property:", error)
      return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
    }

    return NextResponse.json({ message: "Property deleted successfully" })
  } catch (error) {
    console.error("Error in property deletion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
