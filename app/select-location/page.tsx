"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { nigerianStates, nigerianLGAs } from "@/lib/nigeria-data"
import { Navbar } from "@/components/navbar"
import { StateLGAMap } from "@/components/state-lga-map"
import { PastSurveys } from "@/components/past-surveys"
import type { SurveyResult } from "@/lib/models"

export const dynamic = "force-dynamic"

interface State {
  id: number
  name: string
}

interface LocalGovernment {
  id: number
  name: string
  state_id: number
}

interface LGAScore {
  state: string
  lga: string
  count: number
  averageScores: {
    [key: string]: number
  }
}

export default function SelectLocation() {
  const router = useRouter()
  const [states, setStates] = useState<State[]>([])
  const [lgas, setLgas] = useState<LocalGovernment[]>([])
  const [filteredLgas, setFilteredLgas] = useState<LocalGovernment[]>([])
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedLga, setSelectedLga] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [usingFallbackData, setUsingFallbackData] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [lgaScores, setLgaScores] = useState<LGAScore[]>([])
  const [loadingScores, setLoadingScores] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const [pastSurveys, setPastSurveys] = useState<SurveyResult[]>([])
  const [loadingPastSurveys, setLoadingPastSurveys] = useState(false)

  useEffect(() => {
     if (typeof window === "undefined") return
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const fetchStatesAndLgas = async () => {
      try {
        setLoading(true)
        try {
          setStates(nigerianStates)
          setLgas(nigerianLGAs)
        } catch (error) {
          console.log("API fetch failed, using fallback data")
          setUsingFallbackData(true)
        }
      } catch (error) {
        console.error("Error in location data handling:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatesAndLgas()
  }, [])

  useEffect(() => {
    if (selectedState && lgas.length > 0) {
      const stateId = states.find((state) => state.name === selectedState)?.id
      if (stateId) {
        const filtered = lgas.filter((lga) => lga.state_id === stateId)
        setFilteredLgas(filtered)
      }
    } else {
      setFilteredLgas([])
    }
  }, [selectedState, lgas, states])

  useEffect(() => {
    const fetchLGAScores = async () => {
      if (!selectedState || !selectedLga) return

      try {
        setLoadingScores(true)
        setScoreError(null)
        setShowMap(true)

        const response = await fetch("/api/analysis/lga-scores")

        if (!response.ok) {
          throw new Error("Failed to fetch LGA scores")
        }

        const data = await response.json()
        setLgaScores(data)
      } catch (error: any) {
        console.error("Error fetching LGA scores:", error)
        setScoreError(error.message || "Failed to fetch LGA scores")
      } finally {
        setLoadingScores(false)
      }
    }

    fetchLGAScores()
  }, [selectedState, selectedLga])

  useEffect(() => {
    const fetchPastSurveys = async () => {
      if (!selectedState || !selectedLga) {
        setPastSurveys([])
        return
      }

      try {
        setLoadingPastSurveys(true)
        const response = await fetch(`/api/survey-results?state=${selectedState}&lga=${selectedLga}`)

        if (!response.ok) {
          throw new Error("Failed to fetch past surveys")
        }

        const data = await response.json()
        setPastSurveys(data)
      } catch (error: any) {
        console.error("Error fetching past surveys:", error)
        setPastSurveys([])
      } finally {
        setLoadingPastSurveys(false)
      }
    }

    fetchPastSurveys()
  }, [selectedState, selectedLga])

  const handleContinue = () => {
    if (selectedState && selectedLga) {
      localStorage.removeItem("surveyAnswers")
      localStorage.removeItem("currentSectionIndex")
      localStorage.setItem("selectedState", selectedState)
      localStorage.setItem("selectedLga", selectedLga)
      router.push("/survey")
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Your Location</CardTitle>
              <CardDescription>Choose your state and local government area</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {usingFallbackData && <div></div>}
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={selectedState}
                        onValueChange={(value) => {
                          setSelectedState(value)
                          setSelectedLga("")
                          setShowMap(false)
                          setPastSurveys([])
                        }}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.id} value={state.name}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lga">Local Government Area</Label>
                      <Select
                        value={selectedLga}
                        onValueChange={setSelectedLga}
                        disabled={!selectedState || filteredLgas.length === 0}
                      >
                        <SelectTrigger id="lga">
                          <SelectValue placeholder="Select a local government" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredLgas.map((lga) => (
                            <SelectItem key={lga.id} value={lga.name}>
                              {lga.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {!loadingPastSurveys && pastSurveys.length > 0 && (
            <PastSurveys surveys={pastSurveys} selectedLga={selectedLga} />
          )}

          {showMap && (
            <div>
              <StateLGAMap
                selectedState={selectedState}
                selectedLga={selectedLga}
                lgaScores={lgaScores}
                loading={loadingScores}
                error={scoreError}
                onContinue={handleContinue}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
