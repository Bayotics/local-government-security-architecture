"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { colorCoding } from "@/lib/survey-data"
import { features, type Feature } from "@/lgaShapes"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const GeoJSON = dynamic(() => import("react-leaflet").then((mod) => mod.GeoJSON), { ssr: false })

const FitBoundsComponent = dynamic(() => import("./lga-map-bounds"), { ssr: false })

interface LGAScore {
  state: string
  lga: string
  lsarScore: number
  colorCoding: {
    color: string
    label: string
  }
}

export default function LGARatingsMap() {
  const [lgaScores, setLgaScores] = useState<Map<string, LGAScore>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredLGA, setHoveredLGA] = useState<string | null>(null)

  useEffect(() => {
    fetchLGAScores()
  }, [])

  const fetchLGAScores = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/analysis/lga-scores")

      if (!response.ok) {
        throw new Error("Failed to fetch LGA scores")
      }

      const data: LGAScore[] = await response.json()

      const scoresMap = new Map<string, LGAScore>()
      data.forEach((score) => {
        // Normalize LGA name for matching
        const lgaKey = score.lga.toLowerCase().trim()
        scoresMap.set(lgaKey, score)
      })

      setLgaScores(scoresMap)
    } catch (err: any) {
      console.error("Error fetching LGA scores:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getFeatureColor = (feature: Feature): string => {
    const lgaName = feature.properties.shapeName.toLowerCase().trim()
    const score = lgaScores.get(lgaName)

    if (!score || score.lsarScore === 0) {
      return "#E2E8F0" // Light grey for no data
    }

    return score.colorCoding.color
  }

  const featureStyle = (feature: any) => ({
    fillColor: getFeatureColor(feature),
    weight: 1,
    opacity: 1,
    color: "#1e293b",
    fillOpacity: 0.7,
  })

  const onEachFeature = (feature: Feature, layer: any) => {
    const lgaName = feature.properties.shapeName
    const lgaKey = lgaName.toLowerCase().trim()
    const score = lgaScores.get(lgaKey)

    // Hover tooltip
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target
        layer.setStyle({
          weight: 3,
          fillOpacity: 0.9,
        })
        setHoveredLGA(lgaName)
      },
      mouseout: (e: any) => {
        const layer = e.target
        layer.setStyle(featureStyle(feature))
        setHoveredLGA(null)
      },
    })

    // Click popup
    const popupContent = `
      <div style="font-family: system-ui; padding: 8px;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${lgaName}</div>
        <div style="font-size: 13px; color: ${score ? score.colorCoding.color : "#64748b"};">
          ${score ? `Score: ${score.lsarScore.toFixed(1)}%` : "No data available"}
        </div>
        ${score ? `<div style="font-size: 12px; margin-top: 4px;">${score.colorCoding.label}</div>` : ""}
      </div>
    `
    layer.bindPopup(popupContent)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-slate-500">Loading LGA ratings...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          LGA Security Ratings Map
          <Badge variant="outline">{features.length} LGAs</Badge>
        </CardTitle>
        <CardDescription>
          Interactive map showing Local Security Architecture ratings across all 774 Nigerian LGAs
        </CardDescription>

        {/* Color Legend */}
        <div className="space-y-2 mt-4">
          <div className="text-sm font-medium">Rating Scale</div>
          <div className="flex flex-wrap gap-2">
            {colorCoding.map((coding) => (
              <Badge
                key={coding.code}
                variant="outline"
                className="border-2"
                style={{ borderColor: coding.color, color: coding.color }}
              >
                {coding.label} ({coding.min}-{coding.max}%)
              </Badge>
            ))}
            <Badge variant="outline" className="border-2 border-slate-300 text-slate-500">
              No Data
            </Badge>
          </div>
        </div>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total LGAs</p>
            <p className="text-2xl font-bold">{features.length}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">With Data</p>
            <p className="text-2xl font-bold">{lgaScores.size}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">No Data</p>
            <p className="text-2xl font-bold">{features.length - lgaScores.size}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
            <p className="text-2xl font-bold">
              {lgaScores.size > 0
                ? (Array.from(lgaScores.values()).reduce((sum, s) => sum + s.lsarScore, 0) / lgaScores.size).toFixed(1)
                : "0"}
              %
            </p>
          </div>
        </div>

        {hoveredLGA && (
          <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded text-sm">
            Hovering: <span className="font-semibold">{hoveredLGA}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
          <MapContainer
            center={[9.0, 8.0]}
            zoom={6}
            style={{ height: "100%", width: "100%", background: "#f8fafc" }}
            scrollWheelZoom={true}
            className="z-0"
          >
            <FitBoundsComponent />
            <GeoJSON
              data={{ type: "FeatureCollection", features } as any}
              style={featureStyle}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
