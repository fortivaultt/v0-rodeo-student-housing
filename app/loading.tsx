export default function Loading() {
  return (
    <div className="route-overlay" role="status" aria-live="polite" aria-label="Loading page">
      <div className="route-spinner" />
      <span className="sr-only">Loading</span>
    </div>
  )
}
