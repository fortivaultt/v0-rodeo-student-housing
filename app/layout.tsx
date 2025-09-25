import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import ErrorGuard from "@/components/analytics/error-guard"
import RouteTransition from "@/components/ui/route-transition"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Rodeo - Student Housing Made Easy",
  description:
    "Find and book verified student lodges, hotels, and apartments near your campus. Safe, secure, and stress-free.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${poppins.variable}`}>
        <RouteTransition>
          <Suspense fallback={null}>{children}</Suspense>
        </RouteTransition>
        <ErrorGuard />
        <Analytics />
      </body>
    </html>
  )
}
