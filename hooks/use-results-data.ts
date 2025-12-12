"use client"

import { useState, useEffect } from "react"
import { useSurvey } from "@/context/survey-context"
import { sections, getScoreFromOptionId } from "@/lib/survey-data"
import { features } from "@/lgaShapes"
import booleanIntersects from "@turf/turf"
import type { Feature as TurfFeature, Polygon, MultiPolygon } from "geojson"
import type { SurveyResult } from "@/lib/models"
import { compareSurveys, type OverallComparison } from "@/lib/comparison-utils"
import { getLSArColor, type NeighboringLGAData } from "@/lib/results-utils"

export function useResultsData() {
  const { answers, selectedState, selectedLga } = useSurvey()
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({})
  const [overallLSAr, setOverallLSAr] = useState<number>(0)
  const [neighboringLGAs, setNeighboringLGAs] = useState<NeighboringLGAData[]>([])
  const [previousSurvey, setPreviousSurvey] = useState<SurveyResult | null>(null)
  const [comparison, setComparison] = useState<OverallComparison | null>(null)
  const [loadingPreviousSurvey, setLoadingPreviousSurvey] = useState(false)

  // Calculate section scores
  useEffect(() => {
    const scores: Record<string, number> = {}

    sections.forEach((section) => {
      const sectionQuestions = section.questions
      let sectionTotal = 0
      let answeredCount = 0

      sectionQuestions.forEach((question) => {
        if (answers[question.id] !== undefined) {
          const selectedOptionId = answers[question.id] as string
          const score = getScoreFromOptionId(selectedOptionId)
          sectionTotal += score
          answeredCount++
        }
      })

      const rawScore = answeredCount > 0 ? sectionTotal : 0
      const finalScore = rawScore < 0 ? 0 : rawScore
      const maxPossibleScore = sectionQuestions.length
      const percentageScore = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0

      scores[section.title] = Number.parseFloat(percentageScore.toFixed(1))
    })

    setSectionScores(scores)
  }, [answers])

  // Calculate overall LSAr using weighted formula
  useEffect(() => {
    if (Object.keys(sectionScores).length > 0) {
      // Map section titles to their scores
      const decisionMaking = sectionScores["Local Security Decision Making Authority"] || 0 // X1, weight: 2
      const instruments = sectionScores["Development of Local Security Instruments"] || 0 // X2, weight: 1
      const intelligence = sectionScores["Local Security Intelligence and Early Warning"] || 0 // X3, weight: 2
      const resources = sectionScores["Dedicated Resources for Local Security Provision"] || 0 // X4, weight: 2
      const institutions = sectionScores["Local Security Intervention Institutions and Mechanisms"] || 0 // X5, weight: 2
      const evaluation = sectionScores["Local Security Performance Measurement and Evaluation"] || 0 // X6, weight: 1

      // Apply the weighted formula
      const weightedSum =
        2 * decisionMaking + instruments + 2 * intelligence + 2 * resources + 2 * institutions + evaluation
      const lsarScore = weightedSum / 10

      setOverallLSAr(Number.parseFloat(lsarScore.toFixed(1)))
    }
  }, [sectionScores])

  // Get neighboring LGAs
  useEffect(() => {
    const getNeighboringLGAs = async () => {
      if (!selectedLga || !selectedState || features.length === 0) {
        setNeighboringLGAs([])
        return
      }

      const selectedFeature = features.find((f) => f.properties.shapeName === selectedLga)
      if (!selectedFeature) {
        setNeighboringLGAs([])
        return
      }

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
          console.error(`Error checking intersection for ${name}:`, error)
        }
      }

      try {
        const response = await fetch(`/api/analysis/lga-scores?state=${selectedState}`)
        if (response.ok) {
          const data = await response.json()
          const neighboringData: NeighboringLGAData[] = neighbors.map((lga) => {
            const lgaData = data.find((item: any) => item.lga === lga)
            if (lgaData) {
              const scores = Object.values(lgaData.averageScores) as number[]
              const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
              return {
                lga,
                score: Number.parseFloat(avgScore.toFixed(1)),
                color: getLSArColor(avgScore),
              }
            }
            return {
              lga,
              score: 0,
              color: "#e2e8f0",
            }
          })
          setNeighboringLGAs(neighboringData)
        }
      } catch (error) {
        console.error("Error fetching neighboring LGA scores:", error)
        setNeighboringLGAs([])
      }
    }

    if (selectedLga && selectedState && features.length > 0) {
      getNeighboringLGAs()
    } else {
      setNeighboringLGAs([])
    }
  }, [selectedLga, selectedState])

  // Fetch previous survey
  useEffect(() => {
    const fetchPreviousSurvey = async () => {
      if (!selectedState || !selectedLga) return

      try {
        setLoadingPreviousSurvey(true)
        const response = await fetch(`/api/survey-results?state=${selectedState}&lga=${selectedLga}`)

        if (!response.ok) {
          throw new Error("Failed to fetch previous surveys")
        }

        const data: SurveyResult[] = await response.json()

        if (data && data.length > 0) {
          const sortedSurveys = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setPreviousSurvey(sortedSurveys[0])
        } else {
          setPreviousSurvey(null)
        }
      } catch (error: any) {
        console.error("Error fetching previous survey:", error)
        setPreviousSurvey(null)
      } finally {
        setLoadingPreviousSurvey(false)
      }
    }

    fetchPreviousSurvey()
  }, [selectedState, selectedLga])

  // Calculate comparison
  useEffect(() => {
    if (previousSurvey && Object.keys(sectionScores).length > 0 && overallLSAr > 0) {
      const currentSurvey: SurveyResult = {
        state: selectedState || "",
        lga: selectedLga || "",
        date: new Date(),
        sectionScores,
        answers,
        lsarScore: overallLSAr,
        colorCoding: {
          code: "",
          color: "",
          label: "",
        },
      }

      const comparisonResult = compareSurveys(previousSurvey, currentSurvey)
      setComparison(comparisonResult)
    } else {
      setComparison(null)
    }
  }, [previousSurvey, sectionScores, overallLSAr, selectedState, selectedLga, answers])

  return {
    sectionScores,
    overallLSAr,
    neighboringLGAs,
    previousSurvey,
    comparison,
    loadingPreviousSurvey,
  }
}
