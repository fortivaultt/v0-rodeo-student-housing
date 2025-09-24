"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Camera,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Globe,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    promotions: false,
    newProperties: true,
    reviews: true,
  })
  const [darkMode, setDarkMode] = useState(false)

  const user = {
    name: "Adebayo Johnson",
    email: "adebayo.johnson@student.unilag.edu.ng",
    phone: "+234 803 123 4567",
    avatar: "/placeholder.svg?height=100&width=100&text=AJ",
    university: "University of Lagos",
    studentId: "UNILAG/2021/12345",
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
          <h1 className="font-semibold">Settings</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="text-lg font-semibold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Camera className="w-4 h-4" />
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Adebayo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Johnson" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue={user.phone} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input id="university" defaultValue={user.university} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" defaultValue={user.studentId} />
              </div>
            </div>

            <Button className="w-full">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Enter new password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              Update Password
            </Button>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Login Alerts</div>
                  <div className="text-sm text-muted-foreground">Get notified of new logins</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Booking Updates</div>
                <div className="text-sm text-muted-foreground">Confirmations, changes, and reminders</div>
              </div>
              <Switch
                checked={notifications.bookingUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, bookingUpdates: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Promotions & Deals</div>
                <div className="text-sm text-muted-foreground">Special offers and discounts</div>
              </div>
              <Switch
                checked={notifications.promotions}
                onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">New Properties</div>
                <div className="text-sm text-muted-foreground">Properties matching your preferences</div>
              </div>
              <Switch
                checked={notifications.newProperties}
                onCheckedChange={(checked) => setNotifications({ ...notifications, newProperties: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Reviews & Ratings</div>
                <div className="text-sm text-muted-foreground">Reminders to leave reviews</div>
              </div>
              <Switch
                checked={notifications.reviews}
                onCheckedChange={(checked) => setNotifications({ ...notifications, reviews: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Switch between light and dark themes</div>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Language</div>
                <div className="text-sm text-muted-foreground">Choose your preferred language</div>
              </div>
              <Button variant="outline" size="sm">
                English
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Currency</div>
                <div className="text-sm text-muted-foreground">Display prices in your currency</div>
              </div>
              <Button variant="outline" size="sm">
                NGN (₦)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support & Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Support & Legal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-3" />
              Help Center
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-3" />
              Privacy Policy
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <CreditCard className="w-4 h-4 mr-3" />
              Terms of Service
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Globe className="w-4 h-4 mr-3" />
              About Rodeo
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
