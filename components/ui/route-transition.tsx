"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Trigger overlay animation briefly on route changes
    setActive(!media.matches)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setActive(false), media.matches ? 0 : 650)

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className="relative">
      {/* Content fade/slide on enter */}
      <div key={pathname} className="page-enter">
        {children}
      </div>
      {/* Wipe overlay animation */}
      {active ? (
        <div aria-hidden className="route-wipe-container">
          <span className="route-wipe" />
        </div>
      ) : null}
    </div>
  )
}

export default RouteTransition
