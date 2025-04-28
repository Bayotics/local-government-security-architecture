"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { nigerianStates } from "@/lib/nigeria-data"

// Define types for our data
interface LGAScore {
  state: string
  lga: string
  count: number
  averageScores: {
    [key: string]: number
  }
}

interface NigeriaStatesMapProps {
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

// Nigeria state coordinates (simplified for visualization)
const stateCoordinates: Record<string, { x: number; y: number; width: number; height: number }> = {
  Abia: { x: 500, y: 400, width: 40, height: 40 },
  Adamawa: { x: 600, y: 200, width: 50, height: 60 },
  "Akwa Ibom": { x: 520, y: 450, width: 40, height: 40 },
  Anambra: { x: 460, y: 380, width: 40, height: 40 },
  Bauchi: { x: 520, y: 200, width: 50, height: 50 },
  Bayelsa: { x: 440, y: 460, width: 40, height: 30 },
  Benue: { x: 500, y: 300, width: 60, height: 50 },
  Borno: { x: 620, y: 150, width: 70, height: 70 },
  "Cross River": { x: 500, y: 420, width: 40, height: 50 },
  Delta: { x: 420, y: 420, width: 50, height: 40 },
  Ebonyi: { x: 480, y: 370, width: 30, height: 30 },
  Edo: { x: 420, y: 380, width: 40, height: 40 },
  Ekiti: { x: 380, y: 360, width: 30, height: 30 },
  Enugu: { x: 470, y: 350, width: 40, height: 40 },
  FCT: { x: 450, y: 280, width: 30, height: 30 },
  Gombe: { x: 550, y: 200, width: 40, height: 40 },
  Imo: { x: 480, y: 400, width: 30, height: 30 },
  Jigawa: { x: 480, y: 150, width: 50, height: 40 },
  Kaduna: { x: 430, y: 200, width: 50, height: 60 },
  Kano: { x: 450, y: 150, width: 50, height: 50 },
  Katsina: { x: 400, y: 150, width: 50, height: 50 },
  Kebbi: { x: 330, y: 200, width: 50, height: 60 },
  Kogi: { x: 430, y: 300, width: 50, height: 50 },
  Kwara: { x: 370, y: 280, width: 50, height: 50 },
  Lagos: { x: 350, y: 380, width: 40, height: 20 },
  Nasarawa: { x: 470, y: 270, width: 40, height: 40 },
  Niger: { x: 380, y: 230, width: 60, height: 60 },
  Ogun: { x: 350, y: 360, width: 40, height: 40 },
  Ondo: { x: 380, y: 380, width: 40, height: 40 },
  Osun: { x: 370, y: 340, width: 30, height: 30 },
  Oyo: { x: 340, y: 330, width: 50, height: 50 },
  Plateau: { x: 500, y: 250, width: 50, height: 50 },
  Rivers: { x: 460, y: 440, width: 40, height: 40 },
  Sokoto: { x: 320, y: 150, width: 50, height: 50 },
  Taraba: { x: 550, y: 270, width: 50, height: 60 },
  Yobe: { x: 550, y: 150, width: 60, height: 50 },
  Zamfara: { x: 370, y: 180, width: 50, height: 50 },
}

export function NigeriaStatesMap({ selectedState, selectedLga, lgaScores, loading, error }: NigeriaStatesMapProps) {
  const [stateData, setStateData] = useState<Map<string, { score: number; color: string; hasSurvey: boolean }>>(
    new Map(),
  )
  const [lgasInSelectedState, setLgasInSelectedState] = useState<LGAScore[]>([])

  // Process state data when scores change
  useEffect(() => {
    if (lgaScores.length > 0) {
      // Group LGA scores by state
      const stateScores = new Map<string, number[]>()
      const stateSurveys = new Map<string, boolean>()

      lgaScores.forEach((lgaScore) => {
        const { state } = lgaScore
        const score = calculateOverallScore(lgaScore.averageScores)

        // Add score to state's scores array
        if (!stateScores.has(state)) {
          stateScores.set(state, [])
        }
        stateScores.get(state)?.push(score)

        // Mark state as having survey data
        stateSurveys.set(state, true)
      })

      // Calculate average score for each state
      const newStateData = new Map<string, { score: number; color: string; hasSurvey: boolean }>()

      nigerianStates.forEach((state) => {
        const scores = stateScores.get(state.name) || []
        const hasSurvey = stateSurveys.has(state.name)

        if (hasSurvey && scores.length > 0) {
          const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
          newStateData.set(state.name, {
            score: Number.parseFloat(avgScore.toFixed(1)),
            color: getScoreColor(avgScore),
            hasSurvey: true,
          })
        } else {
          newStateData.set(state.name, {
            score: 0,
            color: "#e2e8f0", // slate-200 (light gray)
            hasSurvey: false,
          })
        }
      })

      setStateData(newStateData)

      // Filter LGAs for the selected state
      const lgasInState = lgaScores.filter((lgaScore) => lgaScore.state === selectedState)
      setLgasInSelectedState(lgasInState)
    }
  }, [lgaScores, selectedState])

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Nigeria Security Map</CardTitle>
        <CardDescription>
          Security ratings across Nigeria{selectedState ? ` - ${selectedState} State selected` : ""}
        </CardDescription>
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
            {/* Nigeria Map */}
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              <svg viewBox="0 0 800 500" className="w-full h-auto">
                {/* Background */}
                <rect x="0" y="0" width="800" height="500" fill="#f8fafc" />

                {/* Water bodies (simplified) */}
                <path d="M300,450 Q400,470 500,460 L600,480 L600,500 L300,500 Z" fill="#bfdbfe" opacity="0.5" />

                {/* States */}
                {Object.entries(stateCoordinates).map(([state, coords]) => {
                  const data = stateData.get(state)
                  const isSelected = state === selectedState

                  // Only color states with survey data
                  const fillColor = data?.hasSurvey ? data.color : "#e2e8f0"

                  return (
                    <g key={state}>
                      <rect
                        x={coords.x}
                        y={coords.y}
                        width={coords.width}
                        height={coords.height}
                        fill={fillColor}
                        stroke="#1e293b"
                        strokeWidth={isSelected ? 2 : 1}
                        opacity={isSelected ? 1 : data?.hasSurvey ? 0.9 : 0.5}
                        rx={5}
                        ry={5}
                        className="transition-all duration-200"
                      >
                        <title>
                          {state} {data?.hasSurvey ? `(${data.score}/10)` : "(No data)"}
                        </title>
                      </rect>
                      <text
                        x={coords.x + coords.width / 2}
                        y={coords.y + coords.height / 2}
                        fontSize="10"
                        fontWeight={isSelected ? "bold" : "normal"}
                        fill="#1e293b"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {state}
                      </text>
                    </g>
                  )
                })}
              </svg>
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

            {/* LGAs in Selected State */}
            {selectedState && (
              <div>
                <div className="text-sm font-medium mb-2">Local Governments in {selectedState}</div>
                {lgasInSelectedState.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {lgasInSelectedState.map((lgaScore) => {
                      const score = calculateOverallScore(lgaScore.averageScores)
                      const isSelected = lgaScore.lga === selectedLga
                      return (
                        <div
                          key={lgaScore.lga}
                          className={`flex items-center p-2 rounded-md ${
                            isSelected ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: getScoreColor(score) }}
                          ></div>
                          <span className="flex-1 truncate">{lgaScore.lga}</span>
                          <span>{score}/10</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No survey data available for {selectedState} State
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
