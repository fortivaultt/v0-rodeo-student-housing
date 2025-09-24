"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Heart,
  Share,
  Star,
  MapPin,
  Wifi,
  Zap,
  Shield,
  Car,
  Utensils,
  Tv,
  Wind,
  Phone,
  MessageCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Play,
  Eye,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState("monthly")

  // Mock property data - in real app, fetch based on params.id
  const property = {
    id: 1,
    title: "Grace Lodge - Premium Student Accommodation",
    location: "Akoka, Lagos State",
    fullAddress: "15 Grace Street, Akoka, University of Lagos, Lagos State",
    price: 75000,
    originalPrice: 85000,
    currency: "₦",
    period: "month",
    rating: 4.8,
    reviews: 124,
    distance: "0.5km from UNILAG campus",
    verified: true,
    images: [
      "/placeholder.svg?height=400&width=600&text=Grace+Lodge+Exterior",
      "/placeholder.svg?height=400&width=600&text=Bedroom+View",
      "/placeholder.svg?height=400&width=600&text=Kitchen+Area",
      "/placeholder.svg?height=400&width=600&text=Common+Room",
      "/placeholder.svg?height=400&width=600&text=Bathroom",
    ],
    amenities: [
      { name: "High-Speed Wi-Fi", icon: <Wifi className="w-5 h-5" />, available: true },
      { name: "24/7 Power Supply", icon: <Zap className="w-5 h-5" />, available: true },
      { name: "24/7 Security", icon: <Shield className="w-5 h-5" />, available: true },
      { name: "Parking Space", icon: <Car className="w-5 h-5" />, available: true },
      { name: "Shared Kitchen", icon: <Utensils className="w-5 h-5" />, available: true },
      { name: "Cable TV", icon: <Tv className="w-5 h-5" />, available: true },
      { name: "Air Conditioning", icon: <Wind className="w-5 h-5" />, available: false },
      { name: "Laundry Service", icon: <Shield className="w-5 h-5" />, available: true },
    ],
    description:
      "Grace Lodge offers premium student accommodation just minutes away from the University of Lagos campus. Our modern facilities and secure environment provide the perfect home away from home for serious students.",
    landlord: {
      name: "Mrs. Grace Adebayo",
      avatar: "/placeholder.svg?height=50&width=50&text=GA",
      rating: 4.9,
      properties: 12,
      responseTime: "Usually responds within 2 hours",
    },
    policies: {
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      cancellation: "Free cancellation up to 24 hours before check-in",
      deposit: "₦50,000 security deposit required",
    },
  }

  const durations = [
    { id: "daily", label: "Daily", price: 2500 },
    { id: "weekly", label: "Weekly", price: 15000 },
    { id: "monthly", label: "Monthly", price: 75000 },
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))
  }

  const calculateTotal = () => {
    const selectedPrice = durations.find((d) => d.id === selectedDuration)?.price || 0
    return selectedPrice
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsLiked(!isLiked)}>
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="pb-20">
        {/* Image Carousel */}
        <div className="relative h-64 bg-muted">
          <img
            src={property.images[currentImageIndex] || "/placeholder.svg"}
            alt={`${property.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={prevImage}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
            onClick={nextImage}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>

          {/* Virtual Tour Button */}
          <Button className="absolute bottom-4 left-4 gap-2 bg-primary/90 hover:bg-primary">
            <Play className="w-4 h-4" />
            Virtual Tour
          </Button>
        </div>

        {/* Image Thumbnails */}
        <div className="flex gap-2 p-4 overflow-x-auto">
          {property.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === currentImageIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="p-4 space-y-6">
          {/* Property Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h1 className="text-xl font-bold font-[family-name:var(--font-poppins)] text-balance">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{property.location}</span>
                </div>
              </div>
              {property.verified && (
                <Badge className="bg-accent text-accent-foreground">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{property.rating}</span>
                <span className="text-muted-foreground">({property.reviews} reviews)</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{property.distance}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {property.currency}
                {property.price.toLocaleString()}
              </span>
              {property.originalPrice > property.price && (
                <span className="text-lg text-muted-foreground line-through">
                  {property.currency}
                  {property.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-muted-foreground">per {property.period}</span>
            </div>
            <p className="text-sm text-accent font-medium">Includes utilities</p>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)] mb-3">About this place</h2>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          <Separator />

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)] mb-4">
              What this place offers
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {property.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    amenity.available ? "bg-card border-border" : "bg-muted/50 border-muted text-muted-foreground"
                  }`}
                >
                  <div className={amenity.available ? "text-primary" : "text-muted-foreground"}>{amenity.icon}</div>
                  <span className="text-sm font-medium">{amenity.name}</span>
                  {!amenity.available && <span className="text-xs text-muted-foreground ml-auto">Not available</span>}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              <Eye className="w-4 h-4 mr-2" />
              Show all {property.amenities.length} amenities
            </Button>
          </div>

          <Separator />

          {/* Map Section */}
          <div>
            <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)] mb-4">Location</h2>
            <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Interactive map will load here</p>
                <p className="text-xs text-muted-foreground mt-1">Google Maps integration</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{property.fullAddress}</p>
          </div>

          <Separator />

          {/* Landlord Info */}
          <div>
            <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)] mb-4">
              Hosted by {property.landlord.name}
            </h2>
            <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
              <img
                src={property.landlord.avatar || "/placeholder.svg"}
                alt={property.landlord.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-medium">{property.landlord.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{property.landlord.rating} rating</span>
                  <span>•</span>
                  <span>{property.landlord.properties} properties</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{property.landlord.responseTime}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Policies */}
          <div>
            <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)] mb-4">
              House rules & policies
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in</span>
                <span>{property.policies.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-out</span>
                <span>{property.policies.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancellation</span>
                <span className="text-right text-sm">{property.policies.cancellation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Security deposit</span>
                <span>{property.policies.deposit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">₦{calculateTotal().toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">
                per {selectedDuration === "daily" ? "night" : selectedDuration.slice(0, -2)}
              </span>
            </div>
            <div className="flex gap-1 mt-1">
              {durations.map((duration) => (
                <Button
                  key={duration.id}
                  variant={selectedDuration === duration.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDuration(duration.id)}
                  className="text-xs"
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Link href={`/booking/${property.id}`}>
              <Button className="gap-2">
                <Calendar className="w-4 h-4" />
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
