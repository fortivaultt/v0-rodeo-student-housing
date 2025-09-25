"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const incRef = useRef<number | null>(null)
  const doneRef = useRef<number | null>(null)

  const prefersReducedMotion = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    []
  )

  useEffect(() => {
    // Begin simulated loading on route change
    if (prefersReducedMotion) {
      // Minimal flash without motion
      setVisible(true)
      setProgress(100)
      doneRef.current && window.clearTimeout(doneRef.current)
      doneRef.current = window.setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 120)
      return
    }

    setVisible(true)
    setProgress(12)

    // Randomized incremental growth up to ~88%
    function scheduleIncrement() {
      incRef.current && window.clearTimeout(incRef.current)
      incRef.current = window.setTimeout(() => {
        setProgress((p) => {
          const next = p + Math.random() * 12 + 4
          return Math.min(next, 88)
        })
        scheduleIncrement()
      }, 160 + Math.random() * 220)
    }
    scheduleIncrement()

    // Complete after short delay (simulated)
    doneRef.current && window.clearTimeout(doneRef.current)
    doneRef.current = window.setTimeout(() => {
      setProgress(100)
      // Hide after bar reaches end
      doneRef.current && window.clearTimeout(doneRef.current)
      doneRef.current = window.setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 260)
    }, 700 + Math.random() * 600)

    return () => {
      incRef.current && window.clearTimeout(incRef.current)
      doneRef.current && window.clearTimeout(doneRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className="relative">
      {/* Top progress bar */}
      {visible ? (
        <div className="route-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <div className="route-progress-bar" style={{ width: `${progress}%` }}>
            <span className="route-progress-peg" aria-hidden />
          </div>
        </div>
      ) : null}

      {/* Content subtle enter animation per route */}
      <div key={pathname} className="page-enter-modern">
        {children}
      </div>
    </div>
  )
}
