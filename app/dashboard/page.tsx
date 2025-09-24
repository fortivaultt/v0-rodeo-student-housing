"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Search,
  MapPin,
  Bell,
  User,
  Home,
  Building,
  Building2,
  Clock,
  Star,
  Heart,
  Filter,
  ChevronDown,
  Wifi,
  Zap,
  Shield,
  Car,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useProperties } from "@/hooks/use-properties"
import type { Property } from "@/lib/types/property"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedCity, setSelectedCity] = useState("Lagos")
  const [likedProperties, setLikedProperties] = useState<Set<string>>(new Set())

  const quickFilters = [
    { id: "all", label: "All", icon: <Home className="w-4 h-4" /> },
    { id: "hostel", label: "Hostels", icon: <Home className="w-4 h-4" /> },
    { id: "apartment", label: "Apartments", icon: <Building2 className="w-4 h-4" /> },
    { id: "shared_room", label: "Shared", icon: <Building className="w-4 h-4" /> },
    { id: "private_room", label: "Private", icon: <Clock className="w-4 h-4" /> },
  ]

  const { properties, loading, error } = useProperties({
    city: selectedCity,
    type: selectedFilter === "all" ? undefined : selectedFilter,
    limit: 20,
  })

  const toggleLike = (propertyId: string) => {
    const newLiked = new Set(likedProperties)
    if (newLiked.has(propertyId)) {
      newLiked.delete(propertyId)
    } else {
      newLiked.add(propertyId)
    }
    setLikedProperties(newLiked)
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wi-fi":
      case "wifi":
        return <Wifi className="w-3 h-3" />
      case "24/7 power":
      case "power":
        return <Zap className="w-3 h-3" />
      case "security":
        return <Shield className="w-3 h-3" />
      case "parking":
        return <Car className="w-3 h-3" />
      default:
        return <Home className="w-3 h-3" />
    }
  }

  const formatPrice = (property: Property) => {
    return `₦${property.price_per_month.toLocaleString()}`
  }

  const getPropertyDistance = (property: Property) => {
    return property.distance_to_campus ? `${property.distance_to_campus}km from campus` : "Distance not specified"
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading properties: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold font-[family-name:var(--font-poppins)] text-primary">Rodeo</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedCity}, Nigeria
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCity("Lagos")}>Lagos, Nigeria</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Abuja")}>Abuja, Nigeria</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Port Harcourt")}>
                  Port Harcourt, Nigeria
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCity("Ibadan")}>Ibadan, Nigeria</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Link href="/profile">
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Where do you want to stay?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 h-12 text-base rounded-xl border-2 focus:border-primary"
          />
          <Button size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {filter.icon}
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Properties Sections */}
        <div className="space-y-6">
          {/* Near You Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)]">Near you</h2>
              <Button variant="ghost" size="sm">
                See all
              </Button>
            </div>

            <div className="grid gap-4">
              {loading
                ? // Loading skeletons
                  Array.from({ length: 2 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <Skeleton className="w-32 h-32 flex-shrink-0" />
                          <div className="flex-1 p-4 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-2/3" />
                            <div className="flex gap-2">
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : properties.slice(0, 2).map((property) => (
                    <Link key={property.id} href={`/property/${property.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-0">
                          <div className="flex">
                            <div className="relative w-32 h-32 flex-shrink-0">
                              <img
                                src={property.images[0] || "/placeholder.svg?height=128&width=128"}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                                onClick={(e) => {
                                  e.preventDefault()
                                  toggleLike(property.id)
                                }}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    likedProperties.has(property.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                                  }`}
                                />
                              </Button>
                              {property.verification_status === "verified" && (
                                <Badge className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-xs">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>

                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-sm text-balance">{property.title}</h3>
                                <div className="text-right">
                                  <div className="font-bold text-primary">{formatPrice(property)}</div>
                                  <div className="text-xs text-muted-foreground">per month</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 mb-2">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{property.address}</span>
                              </div>

                              <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">{property.rating}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({property.total_reviews} reviews)
                                </span>
                                <span className="text-xs text-muted-foreground">• {getPropertyDistance(property)}</span>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {property.amenities.slice(0, 3).map((amenity, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                                  >
                                    {getAmenityIcon(amenity)}
                                    <span className="text-xs">{amenity}</span>
                                  </div>
                                ))}
                                {property.amenities.length > 3 && (
                                  <div className="flex items-center bg-secondary px-2 py-1 rounded-md">
                                    <span className="text-xs">+{property.amenities.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
            </div>
          </div>

          {/* All Properties */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)]">All Properties</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {loading
                ? // Loading skeletons
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="flex-shrink-0 w-64 overflow-hidden">
                      <CardContent className="p-0">
                        <Skeleton className="w-full h-40" />
                        <div className="p-3 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : properties.map((property) => (
                    <Link key={property.id} href={`/property/${property.id}`}>
                      <Card className="flex-shrink-0 w-64 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={property.images[0] || "/placeholder.svg?height=160&width=256"}
                              alt={property.title}
                              className="w-full h-40 object-cover"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                              onClick={(e) => {
                                e.preventDefault()
                                toggleLike(property.id)
                              }}
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  likedProperties.has(property.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                                }`}
                              />
                            </Button>
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                              {formatPrice(property)}/month
                            </div>
                            {property.verification_status === "verified" && (
                              <Badge className="absolute bottom-2 left-2 bg-accent text-accent-foreground text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>

                          <div className="p-3">
                            <h3 className="font-semibold text-sm mb-1 text-balance">{property.title}</h3>

                            <div className="flex items-center gap-1 mb-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{property.address}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{property.rating}</span>
                                <span className="text-xs text-muted-foreground">({property.total_reviews})</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{getPropertyDistance(property)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
            </div>
          </div>

          {/* Empty state */}
          {!loading && properties.length === 0 && (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search in a different city.</p>
              <Button onClick={() => setSelectedFilter("all")}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
