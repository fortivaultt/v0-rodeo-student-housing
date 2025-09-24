export interface Property {
  id: string
  landlord_id: string
  title: string
  description: string
  property_type: "hostel" | "apartment" | "shared_room" | "private_room" | "studio"
  address: string
  city: string
  state: string
  country: string
  latitude?: number
  longitude?: number
  price_per_month: number
  price_per_semester?: number
  price_per_year?: number
  currency: string
  max_occupancy: number
  available_rooms: number
  total_rooms: number
  bathrooms: number
  square_meters?: number
  furnished: boolean
  utilities_included: boolean
  wifi_included: boolean
  parking_available: boolean
  security_features: string[]
  house_rules: string[]
  nearby_universities: string[]
  distance_to_campus?: number
  images: string[]
  amenities: string[]
  verification_status: "pending" | "verified" | "rejected"
  is_active: boolean
  featured: boolean
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    profile_image_url?: string
    phone?: string
    email?: string
  }
  reviews?: Review[]
}

export interface Review {
  id: string
  property_id: string
  reviewer_id: string
  booking_id?: string
  rating: number
  title?: string
  comment: string
  images: string[]
  landlord_response?: string
  landlord_response_date?: string
  is_verified: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    profile_image_url?: string
  }
}
