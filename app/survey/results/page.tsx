"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useSurvey } from "@/context/survey-context"
import { useAudio } from "@/context/audio-context"
import { sections } from "@/lib/survey-data"
import { Navbar } from "@/components/navbar"
import { SurveyComparison } from "@/components/survey-comparison"
import { SectionScoresCard } from "@/components/results/section-scores-card"
import { OverallLSArCard } from "@/components/results/overall-lsar-card"
import { NeighboringLGAsCard } from "@/components/results/neighboring-lgas-card"
import { AnalysisCard } from "@/components/results/analysis-card"
import { ResultsActions } from "@/components/results/results-actions"
import { useResultsData } from "@/hooks/use-results-data"
import { useNeighboringAdvisory } from "@/hooks/use-neighboring-advisory"
import { getLSArColor, getLSArRating } from "@/lib/results-utils"
import { generatePDFReport } from "@/lib/pdf-report-generator"

export default function ResultsPage() {
  const router = useRouter()
  const { answers, selectedState, selectedLga } = useSurvey()
  const { setShowPopup, restoreAudioState, playTrack, saveAudioState } = useAudio()
  const [analysis, setAnalysis] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const {
    sectionScores,
    overallLSAr,
    neighboringLGAs,
    previousSurvey,
    comparison,
    loadingPreviousSurvey,
  } = useResultsData()

  const { neighboringAdvisory, loadingAdvisory } = useNeighboringAdvisory(
    neighboringLGAs,
    overallLSAr,
    selectedLga || ""
  )

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!selectedState || !selectedLga) {
      router.push("/select-location")
      return
    }

    // Restore audio state from navigation
    restoreAudioState()
    
    // Set popup state to false since we're no longer in popup
    setShowPopup(false)
    
    // Play survey audio since popup is closed
    playTrack("survey")

    const isComplete = sections.every((section) => {
      const answeredQuestions = section.questions.filter((q) => answers[q.id] !== undefined)
      return answeredQuestions.length >= 3
    })

    if (!isComplete) {
      router.push("/survey")
    }
  }, [answers, selectedState, selectedLga, router, restoreAudioState, setShowPopup, playTrack])

  // Save audio state before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveAudioState()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [saveAudioState])

  // Generate analysis
  const generateAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          state: selectedState,
          lga: selectedLga,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to generate analysis")
      }

      if (!data.analysis) {
        throw new Error("No analysis returned from API")
      }

      setAnalysis(data.analysis)
      await saveToDatabase()
    } catch (error: any) {
      console.error("Error generating analysis:", error)
      setError(error.message || "Failed to generate analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedState && selectedLga && Object.keys(answers).length > 0 && Object.keys(sectionScores).length > 0) {
      generateAnalysis()
    }
  }, [sectionScores])

  const saveToDatabase = async () => {
    try {
      const response = await fetch("/api/survey-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: selectedState,
          lga: selectedLga,
          sectionScores,
          answers,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to save results")
      }

      console.log("Results automatically saved to database")
    } catch (error: any) {
      console.error("Error saving to database:", error)
    }
  }

  const downloadReport = async () => {
    if (!analysis || !selectedState || !selectedLga) return

    setDownloadingPdf(true)
    try {
      await generatePDFReport({
        selectedState,
        selectedLga,
        sectionScores,
        overallLSAr,
        comparison,
        previousSurvey,
        neighboringLGAs,
        neighboringAdvisory,
        analysis,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Security Analysis Results</h1>
            <p className="text-slate-500 dark:text-slate-400">
              {selectedState}, {selectedLga} Local Government
            </p>
          </div>

          <div className="space-y-6">
            <SectionScoresCard sectionScores={sectionScores} />

            <OverallLSArCard
              overallLSAr={overallLSAr}
              selectedLga={selectedLga || ""}
              getLSArColor={getLSArColor}
              getLSArRating={getLSArRating}
            />

            {!loadingPreviousSurvey && comparison && previousSurvey && (
              <SurveyComparison comparison={comparison} previousSurveyDate={previousSurvey.date} />
            )}

            <NeighboringLGAsCard
              neighboringLGAs={neighboringLGAs}
              neighboringAdvisory={neighboringAdvisory}
              loadingAdvisory={loadingAdvisory}
            />

            <AnalysisCard
              loading={loading}
              error={error}
              analysis={analysis}
              onRetry={generateAnalysis}
            />
          </div>

          <ResultsActions
            loading={loading}
            error={error}
            analysis={analysis}
            downloadingPdf={downloadingPdf}
            onBackToSurvey={() => {
              saveAudioState()
              router.push("/survey")
            }}
            onStartNewSurvey={() => {
              localStorage.removeItem("surveyAnswers")
              localStorage.removeItem("currentSectionIndex")
              saveAudioState()
              router.push("/select-location")
            }}
            onDownloadReport={downloadReport}
          />
        </div>
      </div>
    </>
  )
}
