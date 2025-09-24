"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  CalendarIcon,
  CreditCard,
  Shield,
  MapPin,
  Star,
  Smartphone,
  Building2,
  CheckCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [duration, setDuration] = useState("monthly")
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [installments, setInstallments] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock property data
  const property = {
    id: 1,
    title: "Grace Lodge - Premium Student Accommodation",
    location: "Akoka, Lagos State",
    price: 75000,
    currency: "₦",
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=200&width=300&text=Grace+Lodge",
    verified: true,
    landlord: {
      name: "Mrs. Grace Adebayo",
      avatar: "/placeholder.svg?height=50&width=50&text=GA",
    },
  }

  const durations = [
    { id: "daily", label: "Daily", price: 2500, period: "night" },
    { id: "weekly", label: "Weekly", price: 15000, period: "week" },
    { id: "monthly", label: "Monthly", price: 75000, period: "month" },
  ]

  const paymentMethods = [
    {
      id: "paystack",
      name: "Paystack",
      description: "Pay with card, bank transfer, or USSD",
      icon: <CreditCard className="w-5 h-5" />,
      popular: true,
    },
    {
      id: "flutterwave",
      name: "Flutterwave",
      description: "Secure payment with multiple options",
      icon: <CreditCard className="w-5 h-5" />,
      popular: false,
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer with auto-confirmation",
      icon: <Building2 className="w-5 h-5" />,
      popular: false,
    },
    {
      id: "ussd",
      name: "USSD Payment",
      description: "Pay using your mobile phone",
      icon: <Smartphone className="w-5 h-5" />,
      popular: false,
    },
  ]

  const selectedDuration = durations.find((d) => d.id === duration)
  const basePrice = selectedDuration?.price || 0
  const serviceFee = Math.round(basePrice * 0.05)
  const cleaningFee = duration === "daily" ? 2000 : duration === "weekly" ? 5000 : 8000
  const totalPrice = basePrice + serviceFee + cleaningFee

  const handleBooking = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
    setStep(4) // Move to confirmation
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold font-[family-name:var(--font-poppins)] mb-4">Select your stay</h2>

              {/* Duration Selection */}
              <div className="space-y-3 mb-6">
                <Label>Duration</Label>
                <RadioGroup value={duration} onValueChange={setDuration}>
                  {durations.map((dur) => (
                    <div key={dur.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={dur.id} id={dur.id} />
                      <Label htmlFor={dur.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span>{dur.label}</span>
                          <span className="font-medium">
                            ₦{dur.price.toLocaleString()} per {dur.period}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkInDate} onSelect={setCheckInDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={checkOutDate} onSelect={setCheckOutDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-2">
                <Label>Number of guests</Label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{guests}</span>
                  <Button variant="outline" size="sm" onClick={() => setGuests(guests + 1)} disabled={guests >= 4}>
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold font-[family-name:var(--font-poppins)] mb-4">Guest information</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" placeholder="Enter first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" placeholder="Enter last name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="Enter email address" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" placeholder="+234 800 000 0000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University/Institution</Label>
                  <Input id="university" placeholder="e.g., University of Lagos" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID (optional)</Label>
                  <Input id="studentId" placeholder="Enter student ID" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency contact</Label>
                  <Input id="emergencyContact" placeholder="Emergency contact number" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special requests (optional)</Label>
                  <Input id="specialRequests" placeholder="Any special requirements or requests" />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold font-[family-name:var(--font-poppins)] mb-4">Payment method</h2>

              <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{method.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          {method.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      >
                        {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Split Payment Option */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="installments" checked={installments} onCheckedChange={setInstallments} />
                  <Label htmlFor="installments" className="flex-1 cursor-pointer">
                    <div>
                      <span className="font-medium">Split payment (Installments)</span>
                      <p className="text-sm text-muted-foreground">
                        Pay 50% now, 50% in 30 days. Perfect for students!
                      </p>
                    </div>
                  </Label>
                </div>
              </div>

              {installments && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-accent mb-2">Payment Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Today:</span>
                      <span className="font-medium">₦{Math.round(totalPrice / 2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In 30 days:</span>
                      <span className="font-medium">₦{Math.round(totalPrice / 2).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>

            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-poppins)] text-accent mb-2">
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground">Your reservation has been successfully processed</p>
            </div>

            <Card className="text-left">
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID:</span>
                  <span className="font-mono">#RD{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-medium text-right">{property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{selectedDuration?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total paid:</span>
                  <span className="font-bold text-primary">
                    ₦{installments ? Math.round(totalPrice / 2).toLocaleString() : totalPrice.toLocaleString()}
                  </span>
                </div>
                {installments && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className="font-medium">₦{Math.round(totalPrice / 2).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full gap-2">
                <CalendarIcon className="w-4 h-4" />
                Add to Calendar
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Share Receipt
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">What's next?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Check your email for booking confirmation</li>
                <li>• Contact the landlord 24 hours before check-in</li>
                <li>• Bring a valid ID and student verification</li>
                <li>• Emergency support: +234 800 RODEO (76336)</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => (step > 1 ? setStep(step - 1) : router.back())}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step > 1 ? "Back" : "Cancel"}
          </Button>
          <div className="text-sm text-muted-foreground">Step {step} of 4</div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {["Dates", "Details", "Payment", "Confirm"].map((label, index) => (
              <div
                key={label}
                className={`text-xs ${index + 1 <= step ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">{renderStepContent()}</CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Property Info */}
                <div className="flex gap-3">
                  <img
                    src={property.image || "/placeholder.svg"}
                    alt={property.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-balance">{property.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{property.rating}</span>
                      <span className="text-xs text-muted-foreground">({property.reviews} reviews)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Booking Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{selectedDuration?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests:</span>
                    <span>
                      {guests} guest{guests > 1 ? "s" : ""}
                    </span>
                  </div>
                  {checkInDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span>{format(checkInDate, "MMM dd, yyyy")}</span>
                    </div>
                  )}
                  {checkOutDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span>{format(checkOutDate, "MMM dd, yyyy")}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ₦{basePrice.toLocaleString()} x 1 {selectedDuration?.period}
                    </span>
                    <span>₦{basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>₦{serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cleaning fee</span>
                    <span>₦{cleaningFee.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">₦{totalPrice.toLocaleString()}</span>
                </div>

                {installments && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                    <div className="text-sm">
                      <div className="flex justify-between font-medium">
                        <span>Due today:</span>
                        <span>₦{Math.round(totalPrice / 2).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground mt-1">
                        <span>Due later:</span>
                        <span>₦{Math.round(totalPrice / 2).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {step < 4 && (
                  <Button
                    className="w-full"
                    onClick={() => (step === 3 ? handleBooking() : setStep(step + 1))}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : step === 3 ? (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay ₦{installments ? Math.round(totalPrice / 2).toLocaleString() : totalPrice.toLocaleString()}
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
