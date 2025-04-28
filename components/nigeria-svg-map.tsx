"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Define types for our data
interface LGAScore {
  state: string
  lga: string
  count: number
  averageScores: {
    [key: string]: number
  }
}

interface NigeriaSVGMapProps {
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

export function NigeriaSVGMap({ selectedState, selectedLga, lgaScores, loading, error }: NigeriaSVGMapProps) {
  // Find the selected LGA's score
  const selectedLgaData = lgaScores.find((item) => item.lga === selectedLga && item.state === selectedState)
  const selectedLgaScore = selectedLgaData ? calculateOverallScore(selectedLgaData.averageScores) : 0

  // Get all LGAs in the same state
  const stateLGAs = lgaScores.filter((item) => item.state === selectedState)

  // Create a simplified map of Nigeria with the selected state highlighted
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Nigeria Security Map</CardTitle>
        <CardDescription>Security ratings for {selectedState} State</CardDescription>
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
          <div className="flex flex-col items-center">
            {/* Simplified SVG map of Nigeria with the selected state highlighted */}
            <svg viewBox="0 0 800 800" className="w-full max-w-md h-auto mb-6">
              {/* Simplified Nigeria outline */}
              <path
                d="M200,100 L600,100 L700,300 L600,600 L400,700 L200,600 L100,400 Z"
                fill="#f1f5f9"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* Highlight the selected state */}
              <path
                d="M300,200 L500,200 L550,350 L450,500 L350,500 L250,350 Z"
                fill={getScoreColor(selectedLgaScore)}
                stroke="#1e293b"
                strokeWidth="3"
                opacity="0.7"
              >
                <title>{selectedState} State</title>
              </path>

              {/* Add a marker for the selected LGA */}
              <circle cx="400" cy="350" r="20" fill={getScoreColor(selectedLgaScore)} stroke="#ffffff" strokeWidth="3">
                <title>
                  {selectedLga}, {selectedState}
                </title>
              </circle>

              <text
                x="400"
                y="350"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="bold"
              >
                {selectedLgaScore}
              </text>

              {/* Add text labels */}
              <text x="400" y="550" textAnchor="middle" fill="#1e293b" fontSize="16" fontWeight="bold">
                {selectedState} State
              </text>
            </svg>

            {/* Legend */}
            <div className="w-full">
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

            {/* LGA List */}
            <div className="w-full mt-6">
              <div className="text-sm font-medium mb-2">Local Governments in {selectedState}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stateLGAs.map((item) => {
                  const score = calculateOverallScore(item.averageScores)
                  return (
                    <div
                      key={item.lga}
                      className={`flex items-center p-2 rounded-md ${
                        item.lga === selectedLga ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: getScoreColor(score) }}
                      ></div>
                      <span className="flex-1 truncate">{item.lga}</span>
                      <span>{score}/10</span>
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
