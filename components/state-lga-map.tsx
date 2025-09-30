"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { nigerianLGAs } from "@/lib/nigeria-data"
import { MapContainer, GeoJSON } from "react-leaflet"
import { features } from "@/lgaShapes"
import { useMap } from "react-leaflet"
import { useMemo } from "react"
import L from "leaflet"
import booleanIntersects from "@turf/boolean-intersects"
import type { Feature as TurfFeature, Polygon, MultiPolygon } from "geojson"
import { Button } from "@/components/ui/button"

// Define types for our data
interface LGAScore {
  state: string
  lga: string
  count: number
  averageScores: {
    [key: string]: number
  }
}

interface StateLGAMapProps {
  selectedState: string
  selectedLga: string
  lgaScores: LGAScore[]
  loading: boolean
  error: string | null
  onContinue?: () => void // Added onContinue prop for the continue button
}

// Calculate the overall average score for an LGA
const calculateOverallScore = (scores: { [key: string]: number }): number => {
  const values = Object.values(scores)
  if (values.length === 0) return 0

  const sum = values.reduce((acc, val) => acc + val, 0)
  return Number.parseFloat((sum / values.length).toFixed(1))
}

// Get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 80) return "#8b5cf6" // Purple - Excellent
  if (score >= 60) return "#f37209" // Orange - Good
  if (score >= 40) return "#2323dd" // blue - Satisfactory
  if (score >= 20) return "#f3f728" // Yellow - poor
  return "#e70909" // red
}

function getCentroid(coords: any[]): [number, number] {
  const flat = coords.flat(Number.POSITIVE_INFINITY).filter((c: any) => Array.isArray(c) && c.length === 2)

  const sum = flat.reduce(
    (acc: [number, number], coord: [number, number]) => [acc[0] + coord[0], acc[1] + coord[1]],
    [0, 0],
  )

  return [sum[0] / flat.length, sum[1] / flat.length]
}

function haversineDistance(coord1: [number, number], coord2: [number, number]): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const [lat1, lon1] = coord1
  const [lat2, lon2] = coord2

  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export function StateLGAMap({ selectedState, selectedLga, lgaScores, loading, error, onContinue }: StateLGAMapProps) {
  const [lgasInState, setLgasInState] = useState<string[]>([])
  const [borderLGAs, setBorderLGAs] = useState<string[]>([])
  const [lgaData, setLgaData] = useState<Map<string, { score: number; color: string; hasSurvey: boolean }>>(new Map())

  // Get all LGAs for the selected state
  useEffect(() => {
    if (selectedState) {
      // Get all LGAs for this state from our static data
      const stateId = nigerianLGAs.find(
        (lga) => lga.state_id === nigerianLGAs.find((l) => l.name === selectedLga)?.state_id,
      )?.state_id

      if (stateId) {
        const lgas = nigerianLGAs.filter((lga) => lga.state_id === stateId).map((lga) => lga.name)

        setLgasInState(lgas)
      }
    }
  }, [selectedState, selectedLga])

  // Process LGA data when scores or selected LGA changes
  useEffect(() => {
    if (selectedLga && lgaScores.length > 0 && features.length > 0) {
      console.log("[v0] Calculating border LGAs for:", selectedLga)

      const selectedFeature = features.find((f) => f.properties.shapeName === selectedLga)

      if (selectedFeature) {
        const neighbors: string[] = []

        for (const feature of features) {
          const name = feature.properties.shapeName

          if (name === selectedLga) continue

          try {
            const isAdjacent = booleanIntersects(
              selectedFeature as TurfFeature<Polygon | MultiPolygon>,
              feature as TurfFeature<Polygon | MultiPolygon>,
            )

            if (isAdjacent) {
              neighbors.push(name)
            }
          } catch (error) {
            console.error(`[v0] Error checking intersection for ${name}:`, error)
          }
        }

        console.log("[v0] Found border LGAs:", neighbors)
        setBorderLGAs(neighbors)
      } else {
        console.log("[v0] Selected feature not found, clearing border LGAs")
        setBorderLGAs([])
      }

      // Build score/color map (unchanged)
      const newLgaData = new Map<string, { score: number; color: string; hasSurvey: boolean }>()

      lgasInState.forEach((lga) => {
        const lgaScoreData = lgaScores.find((item) => item.lga === lga && item.state === selectedState)

        if (lgaScoreData) {
          const score = calculateOverallScore(lgaScoreData.averageScores)
          newLgaData.set(lga, {
            score,
            color: getScoreColor(score),
            hasSurvey: true,
          })
        } else {
          newLgaData.set(lga, {
            score: 0,
            color: "#e2e8f0",
            hasSurvey: false,
          })
        }
      })

      setLgaData(newLgaData)
    } else {
      console.log("[v0] Conditions not met for border LGA calculation:", {
        selectedLga: !!selectedLga,
        lgaScoresLength: lgaScores.length,
        featuresLength: features.length,
      })
      setBorderLGAs([])
    }
  }, [selectedLga, lgaScores, lgasInState, selectedState])

  // Zoom on select function
  function ZoomToLGAs({ selected, borders }: { selected: string; borders: string[] }) {
    const map = useMap()

    const bounds = useMemo(() => {
      const selectedFeatures = features.filter(
        (feature) => feature.properties.shapeName === selected || borders.includes(feature.properties.shapeName),
      )

      const allCoords: [number, number][] = []

      selectedFeatures.forEach((feature) => {
        const coords = feature.geometry.coordinates

        // Flatten coordinates for both single and multi polygons
        const flatCoords = feature.geometry.type === "Polygon" ? coords[0] : coords.flat(2)

        flatCoords.forEach((coord: number[]) => {
          if (Array.isArray(coord) && coord.length === 2) {
            allCoords.push([coord[1], coord[0]]) // lat, lng
          }
        })
      })

      return L.latLngBounds(allCoords)
    }, [selected, borders])

    useEffect(() => {
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [80, 80] })
      }
    }, [bounds, map])

    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{selectedState} State Security Map</CardTitle>
        <CardDescription>{selectedLga} and surrounding local governments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Grid-based LGA Map */}
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              <div className="text-center mb-4 font-medium">{selectedState} State LGAs</div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {lgasInState.map((lga) => {
                  const data = lgaData.get(lga)
                  const isSelected = lga === selectedLga
                  const isBordering = borderLGAs.includes(lga)

                  // Only color LGAs with survey data
                  const fillColor = data?.hasSurvey ? data.color : "#e2e8f0"

                  return (
                    <div
                      key={lga}
                      className={`rounded-lg p-3 text-center ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-primary"
                          : isBordering
                            ? "ring-1 ring-offset-1 ring-primary/50"
                            : ""
                      }`}
                      style={{ backgroundColor: fillColor }}
                    >
                      <div className={`text-xs truncate ${data?.hasSurvey ? "text-white" : "text-gray-700"}`}>
                        {lga}
                      </div>
                      {data?.hasSurvey && (
                        <div className={`font-bold ${data?.hasSurvey ? "text-white" : "text-gray-700"}`}>
                          {data.score}%
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div>
              <div className="text-sm font-medium mb-2">Security Rating Scale</div>
              <div className="flex">
                <div className="flex-1 h-4" style= {{ backgroundColor: "#e70909" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#f3f728" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#2323dd" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#f37209" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#8b5cf6" }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>

            {/* Selected and Bordering LGAs */}
            <div>
              <div className="text-sm font-medium mb-2">Selected and Surrounding LGAs</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Selected LGA */}
                <div className="flex items-center p-2 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{
                      backgroundColor: lgaData.get(selectedLga)?.hasSurvey
                        ? lgaData.get(selectedLga)?.color
                        : "#e2e8f0",
                    }}
                  ></div>
                  <span className="flex-1 truncate">{selectedLga} (Selected)</span>
                  <span>
                    {lgaData.get(selectedLga)?.hasSurvey ? `${lgaData.get(selectedLga)?.score}/100` : "No data"}
                  </span>
                </div>

                {/* Bordering LGAs */}
                {borderLGAs.map((lga) => {
                  const data = lgaData.get(lga)
                  return (
                    <div key={lga} className="flex items-center p-2 rounded-md">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: data?.hasSurvey ? data.color : "#e2e8f0" }}
                      ></div>
                      <span className="flex-1 truncate">{lga}</span>
                      <span>{data?.hasSurvey ? `${data.score}/100` : "No data"}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="mt-8">
              {/* GeoJSON Map */}
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Map View</div>
                <MapContainer
                  center={[9.082, 8.6753]} // Nigeria center
                  zoom={6}
                  scrollWheelZoom={false}
                  style={{ height: "500px", width: "100%" }}
                >
                  {/* attribution='&copy; <a href="https://carto.com/">Carto</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" */}
                  {/* <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  /> */}
                  <ZoomToLGAs selected={selectedLga} borders={borderLGAs} />
                  {features
                    .filter(
                      (feature) =>
                        feature.properties.shapeName === selectedLga ||
                        borderLGAs.includes(feature.properties.shapeName),
                    )
                    .map((feature, index) => {
                      const lgaName = feature.properties.shapeName
                      const isSelected = lgaName === selectedLga
                      const data = lgaData.get(lgaName)

                      // Decide color
                      let color = "#10b981" // Default for neighbors with no data
                      if (isSelected) {
                        color = "#1d4ed8"
                      } else if (data?.hasSurvey) {
                        color = getScoreColor(data.score)
                      }

                      // Popup label
                      const popupLabel = data?.hasSurvey
                        ? `${lgaName} - Rating: ${data.score}/10`
                        : `${lgaName} - No data`

                      return (
                        <GeoJSON
                          key={index}
                          data={feature as any}
                          style={{
                            color,
                            weight: isSelected ? 3 : 1,
                            fillOpacity: 0.5,
                          }}
                          onEachFeature={(f, layer) => {
                            layer.bindPopup(popupLabel)
                          }}
                        />
                      )
                    })}
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {onContinue && !loading && !error && (
          <div className="mt-6 pt-4 border-t">
            <Button onClick={onContinue} className="w-full" disabled={!selectedState || !selectedLga}>
              Continue to Survey
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
