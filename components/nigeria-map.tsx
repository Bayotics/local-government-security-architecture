"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { calculateLSAr, getColorCoding } from "@/lib/survey-data"

// Define types for our data
interface LGAScore {
  state: string
  lga: string
  count: number
  averageScores: {
    [key: string]: number
  }
  lsarScore?: number
  colorCoding?: {
    code: string
    color: string
    label: string
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

export function NigeriaMap({ selectedState, selectedLga }: NigeriaMapProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lgaScores, setLgaScores] = useState<LGAScore[]>([])
  const [relevantLGAs, setRelevantLGAs] = useState<{ lga: string; lsarScore: number; colorCoding: any }[]>([])

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

        // Process the data to get relevant LGAs and their LSAr scores
        const borderLGAs = getBorderingLGAs(selectedState, selectedLga, data)

        // Get the selected LGA and its bordering LGAs with their scores
        const relevantLGAData = data
          .filter(
            (item: LGAScore) =>
              (item.lga === selectedLga && item.state === selectedState) ||
              (borderLGAs.includes(item.lga) && item.state === selectedState),
          )
          .map((item: LGAScore) => {
            const lsarScore = calculateLSAr(item.averageScores)
            const colorCoding = getColorCoding(lsarScore)
            return {
              lga: item.lga,
              lsarScore,
              colorCoding,
            }
          })

        // If the selected LGA is not in the data, add it with a default score
        if (!relevantLGAData.some((item) => item.lga === selectedLga)) {
          const defaultColorCoding = getColorCoding(0)
          relevantLGAData.push({
            lga: selectedLga,
            lsarScore: 0,
            colorCoding: defaultColorCoding,
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
        <CardTitle>Local Security Architecture Ratings</CardTitle>
        <CardDescription>
          LSAr scores for {selectedLga}, {selectedState} and surrounding local governments
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
                  <div className="w-6 h-6 rounded-md mr-3" style={{ backgroundColor: item.colorCoding.color }}></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {item.lga} {item.lga === selectedLga ? "(Selected)" : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: item.colorCoding.color }}>
                          {item.colorCoding.label}
                        </span>
                        <span>{item.lsarScore.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
              <div className="text-center mb-4 font-medium">LSAr Visualization</div>
              <div className="grid grid-cols-3 gap-2">
                {relevantLGAs.map((item) => (
                  <div
                    key={item.lga}
                    className={`rounded-lg p-3 text-white text-center ${
                      item.lga === selectedLga ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: item.colorCoding.color }}
                  >
                    <div className="text-xs truncate">{item.lga}</div>
                    <div className="font-bold">{item.lsarScore.toFixed(1)}%</div>
                    <div className="text-xs">{item.colorCoding.code}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2">LSAr Color Scale</div>
              <div className="flex">
                <div className="flex-1 h-4" style={{ backgroundColor: "#EF4444" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#EAB308" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#3B82F6" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#F97316" }}></div>
                <div className="flex-1 h-4" style={{ backgroundColor: "#8B5CF6" }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Red (0-20%)</span>
                <span>Yellow (21-40%)</span>
                <span>Blue (41-60%)</span>
                <span>Orange (61-80%)</span>
                <span>Purple (81-100%)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
