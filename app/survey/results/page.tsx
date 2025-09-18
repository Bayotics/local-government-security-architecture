"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSurvey } from "@/context/survey-context"
import { sections, getScoreFromOptionId } from "@/lib/survey-data"
import { useRouter } from "next/navigation"
import { Loader2, Download, AlertTriangle, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { features } from "@/lgaShapes"
import booleanIntersects from "@turf/boolean-intersects"
import type { Feature as TurfFeature, Polygon, MultiPolygon } from "geojson"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface NeighboringLGAData {
  lga: string
  score: number
  color: string
}

const getLSArColor = (score: number): string => {
  if (score >= 80) return "#8b5cf6" // Purple - Excellent
  if (score >= 60) return "#f37209" // Orange - Good
  if (score >= 40) return "#2323dd" // blue - Satisfactory
  if (score >= 20) return "#f3f728" // Yellow - poor
  return "#ff0000" // red - Very poor
}

const getLSArRating = (score: number): string => {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Satisfactory"
  if (score >= 20) return "Poor"
  return "Very Poor"
}

export default function ResultsPage() {
  const router = useRouter()
  const { answers, selectedState, selectedLga } = useSurvey()
  const [analysis, setAnalysis] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({})
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [neighboringLGAs, setNeighboringLGAs] = useState<NeighboringLGAData[]>([])
  const [overallLSAr, setOverallLSAr] = useState<number>(0)

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

    const isComplete = sections.every((section) => {
      const answeredQuestions = section.questions.filter((q) => answers[q.id] !== undefined)
      return answeredQuestions.length >= 3
    })

    if (!isComplete) {
      router.push("/survey")
    }
  }, [answers, selectedState, selectedLga, router])

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
          console.log(`Question ${question.id}: ${selectedOptionId} = ${score} points`)
        }
      })

      const rawScore = answeredCount > 0 ? sectionTotal : 0
      const finalScore = rawScore < 0 ? 0 : rawScore
      const maxPossibleScore = sectionQuestions.length
      const percentageScore = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0

      scores[section.title] = Number.parseFloat(percentageScore.toFixed(1))
      console.log(`[v0] Section ${section.title}: ${finalScore}/${maxPossibleScore} = ${percentageScore}%`)
    })

    setSectionScores(scores)
  }, [answers])
  console.log(sectionScores)

  useEffect(() => {
    if (Object.keys(sectionScores).length > 0) {
      const scores = Object.values(sectionScores)
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      setOverallLSAr(Number.parseFloat(average.toFixed(1)))
    }
  }, [sectionScores])

  useEffect(() => {
    const getNeighboringLGAs = async () => {
      if (!selectedLga) return

      const selectedFeature = features.find((f) => f.properties.shapeName === selectedLga)
      if (!selectedFeature) {
        console.log("[v0] Selected feature not found for:", selectedLga)
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
          console.error(`[v0] Error checking intersection for ${name}:`, error)
        }
      }

      console.log("[v0] Found neighboring LGAs:", neighbors)

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
          console.log("[v0] Neighboring LGAs data:", neighboringData)
        }
      } catch (error) {
        console.error("Error fetching neighboring LGA scores:", error)
      }
    }

    if (selectedLga && selectedState) {
      getNeighboringLGAs()
    }
  }, [selectedLga, selectedState])

  const generateAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Sending request to /api/analyze with data:", {
        answersCount: Object.keys(answers).length,
        state: selectedState,
        lga: selectedLga,
      })

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

      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

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
  }, [sectionScores]) // Now depends on sectionScores being populated

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
    try {
      if (!analysis || !selectedState || !selectedLga) return

      setDownloadingPdf(true)

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      doc.setFontSize(20)
      doc.setTextColor(0, 51, 102)
      doc.text(`Security Analysis Report`, 105, 20, { align: "center" })

      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text(`${selectedLga} Local Government, ${selectedState} State`, 105, 30, { align: "center" })

      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      const date = new Date().toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      doc.text(`Generated on: ${date}`, 105, 38, { align: "center" })

      doc.setDrawColor(200, 200, 200)
      doc.line(20, 42, 190, 42)

      let currentY = 50

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text("Section Scores", 20, currentY)
      currentY += 5

      const scoresData = Object.entries(sectionScores).map(([title, score]) => [title, `${score}%`])

      autoTable(doc, {
        startY: currentY,
        head: [["Section", "Score (%)"]],
        body: scoresData,
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      })

      currentY = (doc as any).lastAutoTable.finalY + 10

      doc.setFontSize(14)
      doc.text("Overall LSAr Rating", 20, currentY)
      currentY += 8

      const lsarColor = getLSArColor(overallLSAr)
      const lsarRating = getLSArRating(overallLSAr)

      doc.setFontSize(12)
      doc.text(`Score: ${overallLSAr}% - ${lsarRating}`, 20, currentY)
      currentY += 10

      if (neighboringLGAs.length > 0) {
        doc.setFontSize(14)
        doc.text("Neighboring LGAs Comparison", 20, currentY)
        currentY += 5

        const neighborData = neighboringLGAs.map((neighbor) => [
          neighbor.lga,
          neighbor.score > 0 ? `${neighbor.score}%` : "No data",
          neighbor.score > 0 ? getLSArRating(neighbor.score) : "N/A",
        ])

        autoTable(doc, {
          startY: currentY,
          head: [["LGA", "Score (%)", "Rating"]],
          body: neighborData,
          headStyles: {
            fillColor: [0, 51, 102],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 240, 240],
          },
        })

        currentY = (doc as any).lastAutoTable.finalY + 10
      }

      doc.setFontSize(14)
      doc.text("Detailed Analysis", 20, currentY)
      currentY += 8

      const analysisLines = analysis.split("\n")

      analysisLines.forEach((line) => {
        if (currentY > 270) {
          doc.addPage()
          currentY = 20
        }

        if (line.startsWith("# ")) {
          doc.setFontSize(16)
          doc.setTextColor(0, 51, 102)
          doc.text(line.replace("# ", ""), 20, currentY)
          currentY += 8
        } else if (line.startsWith("## ")) {
          doc.setFontSize(14)
          doc.setTextColor(0, 51, 102)
          doc.text(line.replace("## ", ""), 20, currentY)
          currentY += 7
        } else if (line.startsWith("### ")) {
          doc.setFontSize(12)
          doc.setTextColor(0, 51, 102)
          doc.text(line.replace("### ", ""), 20, currentY)
          currentY += 6
        } else if (line.startsWith("- ")) {
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text("•", 20, currentY)
          doc.text(line.replace("- ", ""), 25, currentY)
          currentY += 5
        } else if (line.trim() === "") {
          currentY += 3
        } else {
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)

          const textLines = doc.splitTextToSize(line, 170)
          textLines.forEach((textLine: string) => {
            doc.text(textLine, 20, currentY)
            currentY += 5
          })
        }
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" })
      }

      doc.save(`${selectedLga}_Security_Analysis.pdf`)
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
            <Card>
              <CardHeader>
                <CardTitle>Section Scores</CardTitle>
                <CardDescription>Average scores for each section of the survey (0-100% scale)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(sectionScores).map(([section, score]) => (
                    <div key={section}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{section}</span>
                        <span className="font-medium">{score}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall LSAr Rating</CardTitle>
                <CardDescription>Local Security Architecture Rating for {selectedLga}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: getLSArColor(overallLSAr) }}
                  >
                    {overallLSAr}%
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: getLSArColor(overallLSAr) }}>
                      {getLSArRating(overallLSAr)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      Overall security architecture rating
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {neighboringLGAs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Neighboring LGAs Comparison</CardTitle>
                  <CardDescription>LSAr scores of surrounding local governments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={neighboringLGAs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="lga" angle={-45} textAnchor="end" height={80} fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="score" name="LSAr Score (%)">
                          {neighboringLGAs.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Security Analysis</CardTitle>
                <CardDescription>AI-generated analysis based on your survey responses</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Generating your security analysis...</p>
                  </div>
                ) : error ? (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    <div className="flex justify-center">
                      <Button onClick={generateAnalysis} className="mt-4">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    {analysis ? (
                      analysis.split("\n").map((line, index) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h1 key={index} className="text-2xl font-bold mt-6 mb-4">
                              {line.replace("# ", "")}
                            </h1>
                          )
                        } else if (line.startsWith("## ")) {
                          return (
                            <h2 key={index} className="text-xl font-bold mt-5 mb-3">
                              {line.replace("## ", "")}
                            </h2>
                          )
                        } else if (line.startsWith("### ")) {
                          return (
                            <h3 key={index} className="text-lg font-bold mt-4 mb-2">
                              {line.replace("### ", "")}
                            </h3>
                          )
                        } else if (line.startsWith("- ")) {
                          return (
                            <li key={index} className="ml-4">
                              {line.replace("- ", "")}
                            </li>
                          )
                        } else if (line.trim() === "") {
                          return <br key={index} />
                        } else {
                          return (
                            <p key={index} className="my-2">
                              {line}
                            </p>
                          )
                        }
                      })
                    ) : (
                      <p className="text-center text-slate-500 dark:text-slate-400">
                        No analysis generated. Please try again.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => router.push("/survey")}>
              Back to Survey
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("surveyAnswers")
                  localStorage.removeItem("currentSectionIndex")
                  router.push("/select-location")
                }}
              >
                Start New Survey
              </Button>
              <Button onClick={downloadReport} disabled={loading || !!error || !analysis || downloadingPdf}>
                {downloadingPdf ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
