"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"

export default function FitBoundsComponent() {
  const map = useMap()

  useEffect(() => {
    if (map) {
      const nigeriaBounds: [[number, number], [number, number]] = [
        [4.0, 2.5], // Southwest corner
        [14.0, 15.0], // Northeast corner
      ]

      // Use setTimeout to ensure map is fully initialized
      setTimeout(() => {
        map.fitBounds(nigeriaBounds)
      }, 100)
    }
  }, [map])

  return null
}
