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
    if (prefersReducedMotion) {
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

    function scheduleIncrement() {
      incRef.current && window.clearTimeout(incRef.current)
      incRef.current = window.setTimeout(() => {
        setProgress((p) => Math.min(p + Math.random() * 12 + 4, 88))
        scheduleIncrement()
      }, 160 + Math.random() * 220)
    }
    scheduleIncrement()

    doneRef.current && window.clearTimeout(doneRef.current)
    doneRef.current = window.setTimeout(() => {
      setProgress(100)
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
      {visible ? (
        <div className="route-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} style={{ ["--rt" as any]: `${Math.round(progress)}%` }}>
          <div className="route-progress-bar">
            <span className="route-progress-peg" aria-hidden />
          </div>
        </div>
      ) : null}

      {visible ? (
        <div className="route-overlay" role="status" aria-live="polite" aria-label="Loading page">
          <div className={prefersReducedMotion ? "route-spinner-static" : "route-spinner"} />
          <span className="sr-only">Loading</span>
        </div>
      ) : null}

      <div key={pathname} className="page-enter-modern">
        {children}
      </div>
    </div>
  )
}
