"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { nigerianStates, nigerianLGAs } from "@/lib/nigeria-data"
import { Navbar } from "@/components/navbar"
import dynamic from 'next/dynamic'
const StateLGAMap = dynamic(
  () => import('@/components/state-lga-map').then((mod) => mod.StateLGAMap),
  { ssr: false }
)

const PastSurveys = dynamic(
  () => import('@/components/past-surveys').then((mod) => mod.PastSurveys),
  { ssr: false }
)

import type { SurveyResult } from "@/lib/models"

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
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedLga, setSelectedLga] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
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
      return
    }

    const preSelectedState = localStorage.getItem("selectedState")
    const preSelectedLga = localStorage.getItem("selectedLga")
    
    if (preSelectedState && preSelectedLga) {
      setSelectedState(preSelectedState)
      setSelectedLga(preSelectedLga)
      setShowMap(true)
    }
    
    setLoading(false)
  }, [router])

  useEffect(() => {
    const fetchLGAScores = async () => {
      if (!selectedState || !selectedLga) return

      try {
        setLoadingScores(true)
        setScoreError(null)

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
          {loading ? (
            <Card className="mb-6">
              <CardContent className="py-8">
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Your Location</CardTitle>
                  <CardDescription>
                    {selectedState} - {selectedLga}
                  </CardDescription>
                </CardHeader>
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
            </>
          )}
        </div>
      </div>
    </>
  )
}
