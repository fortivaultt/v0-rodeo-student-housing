"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Shield, Search, CreditCard, Star, MapPin, Wifi, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const onboardingSteps = [
    {
      title: "Search verified student lodges",
      description: "Browse thousands of verified accommodations near your campus",
      icon: <Search className="w-12 h-12 text-primary" />,
      image: "/students-searching-for-accommodation-on-mobile-app.jpg",
    },
    {
      title: "Book instantly, pay securely",
      description: "Reserve your perfect space with secure payment options",
      icon: <CreditCard className="w-12 h-12 text-accent" />,
      image: "/secure-mobile-payment-interface-for-booking.jpg",
    },
    {
      title: "Stay safe, stress-free",
      description: "Enjoy verified properties with 24/7 support and safety features",
      icon: <Shield className="w-12 h-12 text-chart-3" />,
      image: "/safe-student-accommodation-with-security-features.jpg",
    },
  ]

  const features = [
    { icon: <MapPin className="w-5 h-5" />, text: "Near campus locations" },
    { icon: <Wifi className="w-5 h-5" />, text: "High-speed internet" },
    { icon: <Zap className="w-5 h-5" />, text: "24/7 power supply" },
    { icon: <Shield className="w-5 h-5" />, text: "Verified properties" },
  ]

  const handleGetStarted = () => {
    router.push("/auth/sign-up")
  }

  const handleSignIn = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Animated Logo Header */}
      <div className="flex items-center justify-between pt-8 px-6 max-w-md mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-poppins)] text-primary">Rodeo</h1>
          <p className="text-sm text-muted-foreground text-center mt-1">Student Housing</p>
        </div>
        {/* Sign In Button */}
        <Button variant="ghost" onClick={handleSignIn} className="text-sm">
          Sign In
        </Button>
      </div>

      {/* Onboarding Carousel */}
      <div className="max-w-md mx-auto px-6">
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <img
                src={onboardingSteps[currentStep].image || "/placeholder.svg"}
                alt={onboardingSteps[currentStep].title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="flex justify-center mb-4">{onboardingSteps[currentStep].icon}</div>
            </div>

            <h2 className="text-2xl font-semibold font-[family-name:var(--font-poppins)] text-foreground mb-3 text-balance">
              {onboardingSteps[currentStep].title}
            </h2>

            <p className="text-muted-foreground mb-8 text-pretty leading-relaxed">
              {onboardingSteps[currentStep].description}
            </p>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-8">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentStep < onboardingSteps.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setCurrentStep(onboardingSteps.length - 1)}
                  >
                    Skip
                  </Button>
                  <Button className="flex-1 gap-2" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90" onClick={handleGetStarted}>
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 mb-12">
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 bg-card/60 backdrop-blur-sm rounded-lg p-3 border">
                <div className="text-primary">{feature.icon}</div>
                <span className="text-sm text-foreground font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-accent text-accent" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Trusted by 10,000+ students across Nigeria</p>
        </div>
      </div>
    </div>
  )
}
