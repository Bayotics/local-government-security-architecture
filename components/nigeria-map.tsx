"use client"

import { useState, useEffect } from "react"
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

interface LGABorders {
  [key: string]: {
    [key: string]: string[] // State -> LGA -> bordering LGAs
  }
}

interface NigeriaMapProps {
  selectedState: string
  selectedLga: string
}

// This is a simplified mapping of some LGAs and their bordering LGAs
// In a real application, this would be more comprehensive or fetched from an API
const LGA_BORDERS: LGABorders = {
  Lagos: {
    Alimosho: ["Agege", "Ifako-Ijaiye", "Ikeja", "Oshodi-Isolo", "Amuwo-Odofin"],
    Ikeja: ["Alimosho", "Agege", "Oshodi-Isolo", "Mushin", "Shomolu"],
    "Oshodi-Isolo": ["Alimosho", "Ikeja", "Mushin", "Surulere", "Amuwo-Odofin"],
    Agege: ["Alimosho", "Ikeja", "Ifako-Ijaiye"],
    "Amuwo-Odofin": ["Alimosho", "Oshodi-Isolo", "Surulere", "Ajeromi-Ifelodun", "Apapa"],
  },
  Ogun: {
    "Abeokuta North": ["Abeokuta South", "Odeda", "Ewekoro", "Ifo"],
    "Abeokuta South": ["Abeokuta North", "Odeda", "Obafemi Owode"],
    "Ado-Odo/Ota": ["Ifo", "Ewekoro", "Ipokia"],
  },
  FCT: {
    "Municipal Area Council": ["Bwari", "Gwagwalada", "Kuje", "Abaji"],
    Bwari: ["Municipal Area Council", "Gwagwalada", "Kwali"],
  },
  Kano: {
    "Kano Municipal": ["Fagge", "Dala", "Gwale", "Tarauni", "Nassarawa"],
    Fagge: ["Kano Municipal", "Dala", "Gwale"],
  },
  Rivers: {
    "Port Harcourt": ["Obio/Akpor", "Eleme", "Okrika", "Oyigbo"],
    "Obio/Akpor": ["Port Harcourt", "Ikwerre", "Etche", "Oyigbo"],
  },
}

// Fallback: If we don't have specific border data, show all LGAs in the same state
const getFallbackBorderingLGAs = (state: string, lga: string, allLGAs: LGAScore[]): string[] => {
  return allLGAs.filter((item) => item.state === state && item.lga !== lga).map((item) => item.lga)
}

// Get the bordering LGAs for a selected LGA
const getBorderingLGAs = (state: string, lga: string, allLGAs: LGAScore[]): string[] => {
  // Check if we have specific border data
  if (LGA_BORDERS[state] && LGA_BORDERS[state][lga]) {
    return LGA_BORDERS[state][lga]
  }

  // Fallback to showing all LGAs in the same state
  return getFallbackBorderingLGAs(state, lga, allLGAs)
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
  if (score >= 9) return "bg-blue-500"
  if (score >= 8) return "bg-purple-500"
  if (score >= 7) return "bg-green-500"
  if (score >= 6) return "bg-yellow-500"
  if (score >= 5) return "bg-orange-500"
  if (score >= 4) return "bg-red-500"
  if (score >= 3) return "bg-red-700"
  if (score >= 2) return "bg-gray-700"
  return "bg-gray-900"
}

export function NigeriaMap({ selectedState, selectedLga }: NigeriaMapProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lgaScores, setLgaScores] = useState<LGAScore[]>([])
  const [relevantLGAs, setRelevantLGAs] = useState<{ lga: string; score: number; color: string }[]>([])

  // Fetch LGA scores
  useEffect(() => {
    const fetchLGAScores = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/analysis/lga-scores")

        if (!response.ok) {
          throw new Error("Failed to fetch LGA scores")
        }

        const data = await response.json()
        setLgaScores(data)

        // Process the data to get relevant LGAs and their scores
        const borderLGAs = getBorderingLGAs(selectedState, selectedLga, data)

        // Get the selected LGA and its bordering LGAs with their scores
        const relevantLGAData = data
          .filter(
            (item) =>
              (item.lga === selectedLga && item.state === selectedState) ||
              (borderLGAs.includes(item.lga) && item.state === selectedState),
          )
          .map((item) => {
            const score = calculateOverallScore(item.averageScores)
            return {
              lga: item.lga,
              score,
              color: getScoreColor(score),
            }
          })

        // If the selected LGA is not in the data, add it with a default score
        if (!relevantLGAData.some((item) => item.lga === selectedLga)) {
          relevantLGAData.push({
            lga: selectedLga,
            score: 0,
            color: getScoreColor(0),
          })
        }

        setRelevantLGAs(relevantLGAData)
      } catch (error: any) {
        console.error("Error fetching LGA scores:", error)
        setError(error.message || "Failed to fetch LGA scores")
      } finally {
        setLoading(false)
      }
    }

    if (selectedState && selectedLga) {
      fetchLGAScores()
    }
  }, [selectedState, selectedLga])

  // Render a simplified map visualization
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Security Ratings Map</CardTitle>
        <CardDescription>
          {selectedLga}, {selectedState} and surrounding local governments
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
        ) : relevantLGAs.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No data available for this area</div>
        ) : (
          <div>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {relevantLGAs.map((item) => (
                <div key={item.lga} className="flex items-center">
                  <div className={`w-6 h-6 rounded-md mr-3 ${item.color}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {item.lga} {item.lga === selectedLga ? "(Selected)" : ""}
                      </span>
                      <span>{item.score}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              <div className="text-center mb-4 font-medium">Simplified Map Visualization</div>
              <div className="grid grid-cols-3 gap-2">
                {relevantLGAs.map((item) => (
                  <div
                    key={item.lga}
                    className={`${item.color} rounded-lg p-3 text-white text-center ${
                      item.lga === selectedLga ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                  >
                    <div className="text-xs truncate">{item.lga}</div>
                    <div className="font-bold">{item.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Color Scale</div>
              <div className="flex">
                <div className="flex-1 h-4 bg-gray-900"></div>
                <div className="flex-1 h-4 bg-gray-700"></div>
                <div className="flex-1 h-4 bg-red-700"></div>
                <div className="flex-1 h-4 bg-red-500"></div>
                <div className="flex-1 h-4 bg-orange-500"></div>
                <div className="flex-1 h-4 bg-yellow-500"></div>
                <div className="flex-1 h-4 bg-green-500"></div>
                <div className="flex-1 h-4 bg-purple-500"></div>
                <div className="flex-1 h-4 bg-blue-500"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
