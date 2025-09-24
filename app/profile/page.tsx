"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Settings,
  Star,
  MapPin,
  Heart,
  CreditCard,
  Shield,
  Trophy,
  Edit,
  Phone,
  Mail,
  School,
  CheckCircle,
  Clock,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("bookings")

  // Mock user data
  const user = {
    id: 1,
    name: "Adebayo Johnson",
    email: "adebayo.johnson@student.unilag.edu.ng",
    phone: "+234 803 123 4567",
    avatar: "/placeholder.svg?height=100&width=100&text=AJ",
    university: "University of Lagos",
    studentId: "UNILAG/2021/12345",
    joinDate: "March 2024",
    verified: true,
    rating: 4.9,
    totalBookings: 12,
    badges: ["Top 10% Explorer", "Verified Student", "Trusted Guest"],
  }

  const mockBookings = [
    {
      id: 1,
      property: {
        title: "Grace Lodge - UNILAG",
        location: "Akoka, Lagos",
        image: "/placeholder.svg?height=80&width=120&text=Grace+Lodge",
      },
      bookingId: "RD123456",
      status: "confirmed",
      checkIn: "2024-01-15",
      checkOut: "2024-05-15",
      duration: "4 months",
      amount: 300000,
      guests: 1,
    },
    {
      id: 2,
      property: {
        title: "Royal Heights Hotel",
        location: "Victoria Island, Lagos",
        image: "/placeholder.svg?height=80&width=120&text=Royal+Heights",
      },
      bookingId: "RD123457",
      status: "completed",
      checkIn: "2023-12-20",
      checkOut: "2023-12-25",
      duration: "5 nights",
      amount: 75000,
      guests: 2,
    },
    {
      id: 3,
      property: {
        title: "Student Paradise Apartments",
        location: "Yaba, Lagos",
        image: "/placeholder.svg?height=80&width=120&text=Student+Paradise",
      },
      bookingId: "RD123458",
      status: "cancelled",
      checkIn: "2024-02-01",
      checkOut: "2024-06-01",
      duration: "4 months",
      amount: 480000,
      guests: 1,
    },
  ]

  const mockSavedProperties = [
    {
      id: 1,
      title: "Comfort Lodge - UI",
      location: "Ibadan, Oyo State",
      price: "₦65,000",
      period: "month",
      rating: 4.7,
      reviews: 89,
      image: "/placeholder.svg?height=120&width=180&text=Comfort+Lodge",
      verified: true,
    },
    {
      id: 2,
      title: "Elite Student Hostel",
      location: "Surulere, Lagos",
      price: "₦85,000",
      period: "month",
      rating: 4.8,
      reviews: 156,
      image: "/placeholder.svg?height=120&width=180&text=Elite+Hostel",
      verified: true,
    },
    {
      id: 3,
      title: "Campus View Apartments",
      location: "Akoka, Lagos",
      price: "₦95,000",
      period: "month",
      rating: 4.6,
      reviews: 67,
      image: "/placeholder.svg?height=120&width=180&text=Campus+View",
      verified: false,
    },
  ]

  const mockReviews = [
    {
      id: 1,
      property: {
        title: "Grace Lodge - UNILAG",
        image: "/placeholder.svg?height=60&width=60&text=GL",
      },
      rating: 5,
      comment:
        "Excellent accommodation! Very clean, secure, and close to campus. The Wi-Fi is fast and the power supply is reliable. Highly recommend for serious students.",
      date: "2024-01-20",
      helpful: 12,
    },
    {
      id: 2,
      property: {
        title: "Royal Heights Hotel",
        image: "/placeholder.svg?height=60&width=60&text=RH",
      },
      rating: 4,
      comment:
        "Great location and good service. The room was comfortable and clean. Only downside was the breakfast could be better.",
      date: "2023-12-26",
      helpful: 8,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-accent text-accent-foreground"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-3 h-3" />
      case "completed":
        return <CheckCircle className="w-3 h-3" />
      case "cancelled":
        return <X className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
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
          <Link href="/profile/settings">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {user.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-accent rounded-full p-1">
                    <Shield className="w-3 h-3 text-accent-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold font-[family-name:var(--font-poppins)]">{user.name}</h1>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="w-3 h-3" />
                    <span>{user.university}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {user.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{user.totalBookings}</div>
                    <div className="text-xs text-muted-foreground">Total Bookings</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold">{user.rating}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Guest Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-accent">Member</div>
                    <div className="text-xs text-muted-foreground">Since {user.joinDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)]">Your Bookings</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All
                </Button>
                <Button variant="ghost" size="sm">
                  Active
                </Button>
                <Button variant="ghost" size="sm">
                  Past
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {mockBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={booking.property.image || "/placeholder.svg"}
                        alt={booking.property.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-balance">{booking.property.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{booking.property.location}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Booking ID:</span>
                            <span className="ml-2 font-mono">{booking.bookingId}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2">{booking.duration}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Check-in:</span>
                            <span className="ml-2">{new Date(booking.checkIn).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="ml-2 font-semibold">₦{booking.amount.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {booking.status === "confirmed" && (
                            <>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                              <Button size="sm" variant="ghost">
                                Contact Host
                              </Button>
                            </>
                          )}
                          {booking.status === "completed" && (
                            <>
                              <Button size="sm" variant="outline">
                                Leave Review
                              </Button>
                              <Button size="sm" variant="ghost">
                                Book Again
                              </Button>
                            </>
                          )}
                          {booking.status === "cancelled" && (
                            <Button size="sm" variant="outline">
                              View Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Saved Properties Tab */}
          <TabsContent value="saved" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)]">Saved Properties</h2>
              <span className="text-sm text-muted-foreground">{mockSavedProperties.length} properties</span>
            </div>

            <div className="grid gap-4">
              {mockSavedProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        <img
                          src={property.image || "/placeholder.svg"}
                          alt={property.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        {property.verified && (
                          <Badge className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-balance">{property.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{property.location}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            <Heart className="w-4 h-4 fill-current" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{property.rating}</span>
                            <span className="text-sm text-muted-foreground">({property.reviews} reviews)</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-bold text-primary">{property.price}</span>
                            <span className="text-muted-foreground"> per {property.period}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/property/${property.id}`}>
                            <Button size="sm">View Property</Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)]">Your Reviews</h2>
              <span className="text-sm text-muted-foreground">{mockReviews.length} reviews written</span>
            </div>

            <div className="space-y-4">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={review.property.image || "/placeholder.svg"}
                        alt={review.property.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{review.property.title}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{review.comment}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {review.helpful} people found this helpful
                          </span>
                          <Button variant="ghost" size="sm" className="text-xs">
                            Edit Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-poppins)]">Payment Methods</h2>
              <Button size="sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">•••• •••• •••• 4532</div>
                      <div className="text-sm text-muted-foreground">Expires 12/26</div>
                    </div>
                    <Badge variant="secondary">Default</Badge>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-red-600 to-red-800 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MC</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">•••• •••• •••• 8901</div>
                      <div className="text-sm text-muted-foreground">Expires 08/27</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Payment History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">Grace Lodge - UNILAG</div>
                      <div className="text-sm text-muted-foreground">Jan 15, 2024</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₦300,000</div>
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">Royal Heights Hotel</div>
                      <div className="text-sm text-muted-foreground">Dec 20, 2023</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₦75,000</div>
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
