"use client"
import { useEffect } from "react"

export default function ErrorGuard() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      try {
        const message = event?.message || (event?.error && String(event.error)) || ""
        const filename = (event as any)?.filename || ""

        if (
          message.includes("Failed to fetch") &&
          (filename.includes("edge.fullstory") || filename.includes("fs.js") || message.toLowerCase().includes("fullstory"))
        ) {
          // Suppress noisy FullStory network errors that can break HMR or surface as uncaught
          // Do not swallow other errors
          // Prevent the default logging for this specific noise
          event.preventDefault?.()
          // eslint-disable-next-line no-console
          console.warn("Suppressed FullStory network error:", { message, filename })
        }
      } catch (err) {
        // ignore
      }
    }

    function onRejection(event: PromiseRejectionEvent) {
      try {
        const reason = (event && (event as any).reason && String((event as any).reason)) || ""
        if (reason.includes("Failed to fetch") && reason.toLowerCase().includes("fullstory")) {
          event.preventDefault?.()
          // eslint-disable-next-line no-console
          console.warn("Suppressed FullStory unhandled rejection:", reason)
        }
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejection)
    }
  }, [])

  return null
}
