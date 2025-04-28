"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { nigerianLGAs } from "@/lib/nigeria-data"
import { getBorderingLGAs } from "./nigeria-lga-borders"

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
  if (score >= 9) return "#3b82f6" // blue-500
  if (score >= 8) return "#8b5cf6" // purple-500
  if (score >= 7) return "#22c55e" // green-500
  if (score >= 6) return "#eab308" // yellow-500
  if (score >= 5) return "#f97316" // orange-500
  if (score >= 4) return "#ef4444" // red-500
  if (score >= 3) return "#b91c1c" // red-700
  if (score >= 2) return "#374151" // gray-700
  return "#111827" // gray-900
}

export function StateLGAMap({ selectedState, selectedLga, lgaScores, loading, error }: StateLGAMapProps) {
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
    if (selectedLga && lgaScores.length > 0) {
      // Get bordering LGAs using our data
      const bordering = getBorderingLGAs(selectedState, selectedLga)
      setBorderLGAs(bordering)

      // Create a map of LGA data with scores and colors
      const newLgaData = new Map<string, { score: number; color: string; hasSurvey: boolean }>()

      // Process all LGAs in this state
      lgasInState.forEach((lga) => {
        // Find score data for this LGA
        const lgaScoreData = lgaScores.find((item) => item.lga === lga && item.state === selectedState)

        if (lgaScoreData) {
          // LGA has survey data
          const score = calculateOverallScore(lgaScoreData.averageScores)
          newLgaData.set(lga, {
            score,
            color: getScoreColor(score),
            hasSurvey: true,
          })
        } else {
          // LGA has no survey data
          newLgaData.set(lga, {
            score: 0,
            color: "#e2e8f0", // slate-200 (light gray)
            hasSurvey: false,
          })
        }
      })

      setLgaData(newLgaData)
    }
  }, [selectedLga, lgaScores, lgasInState, selectedState])

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
                          {data.score}
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
                <div className="flex-1 h-4" style={{ backgroundColor: "#111827" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#374151" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#b91c1c" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#ef4444" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#f97316" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#eab308" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#22c55e" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#8b5cf6" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#3b82f6" }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
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
                    {lgaData.get(selectedLga)?.hasSurvey ? `${lgaData.get(selectedLga)?.score}/10` : "No data"}
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
                      <span>{data?.hasSurvey ? `${data.score}/10` : "No data"}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
