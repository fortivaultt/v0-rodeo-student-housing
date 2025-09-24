"use client"

import { useState, useEffect } from "react"
import type { Property } from "@/lib/types/property"

interface UsePropertiesOptions {
  city?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.city) params.append("city", options.city)
      if (options.type) params.append("type", options.type)
      if (options.minPrice) params.append("minPrice", options.minPrice.toString())
      if (options.maxPrice) params.append("maxPrice", options.maxPrice.toString())
      if (options.limit) params.append("limit", options.limit.toString())
      if (options.offset) params.append("offset", options.offset.toString())

      const response = await fetch(`/api/properties?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }

      const data = await response.json()
      setProperties(data.properties || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [options.city, options.type, options.minPrice, options.maxPrice, options.limit, options.offset])

  return { properties, loading, error, refetch: () => fetchProperties() }
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperty = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/properties/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch property")
      }

      const data = await response.json()
      setProperty(data.property)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchProperty()
    }
  }, [id])

  return { property, loading, error }
}
