"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSurvey } from "@/context/survey-context"
import { sections, getScoreFromOptionId } from "@/lib/survey-data"
import { useRouter } from "next/navigation"
import { Loader2, Download, BarChart3, FileText, AlertTriangle, RefreshCcw, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Navbar } from "@/components/navbar"

export default function ResultsPage() {
  const router = useRouter()
  const { answers, selectedState, selectedLga } = useSurvey()
  const [analysis, setAnalysis] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const [sectionScores, setSectionScores] = useState<Record<string, number>>({})
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [savingToDb, setSavingToDb] = useState(false)
  const [savedToDb, setSavedToDb] = useState(false)

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    // Redirect if survey not complete
    if (!selectedState || !selectedLga) {
      router.push("/select-location")
      return
    }

    // Check if at least 3 questions are answered in each section
    const isComplete = sections.every((section) => {
      const answeredQuestions = section.questions.filter((q) => answers[q.id] !== undefined)
      return answeredQuestions.length >= 3
    })

    if (!isComplete) {
      router.push("/survey")
    }
  }, [answers, selectedState, selectedLga, router])

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
          console.log(`[v0] Question ${question.id}: ${selectedOptionId} = ${score} points`)
        }
      })

      const rawScore = answeredCount > 0 ? sectionTotal : 0
      const finalScore = rawScore < 0 ? 0 : rawScore
      // Maximum possible score is the number of questions (each can score max 1 point)
      const maxPossibleScore = sectionQuestions.length
      const percentageScore = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0

      scores[section.title] = Number.parseFloat(percentageScore.toFixed(1))
      console.log(`[v0] Section ${section.title}: ${finalScore}/${maxPossibleScore} = ${percentageScore}%`)
    })

    setSectionScores(scores)
  }, [answers])
  console.log(sectionScores)

  // Generate analysis
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
    } catch (error: any) {
      console.error("Error generating analysis:", error)
      setError(error.message || "Failed to generate analysis. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedState && selectedLga && Object.keys(answers).length > 0) {
      generateAnalysis()
    }
  }, []) // Empty dependency array to run only once on mount

  // Save results to MongoDB
  const saveToDatabase = async () => {
    try {
      setSavingToDb(true)

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

      setSavedToDb(true)
      setTimeout(() => setSavedToDb(false), 3000)
    } catch (error: any) {
      console.error("Error saving to database:", error)
      setError(error.message || "Failed to save results to database. Please try again.")
    } finally {
      setSavingToDb(false)
    }
  }

  // Download report as PDF
  const downloadReport = async () => {
    try {
      if (!analysis || !selectedState || !selectedLga) return

      setDownloadingPdf(true)

      const { jsPDF } = await import("jspdf")
      const autoTable = (await import("jspdf-autotable")).default

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

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text("Section Scores", 20, 50)

      const scoresData = Object.entries(sectionScores).map(([title, score]) => [title, `${score}%`])

      autoTable(doc, {
        startY: 55,
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

      const tableEndY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(14)
      doc.text("Detailed Analysis", 20, tableEndY)

      const analysisLines = analysis.split("\n")
      let currentY = tableEndY + 8
      let currentPage = 1

      analysisLines.forEach((line) => {
        if (currentY > 270) {
          doc.addPage()
          currentPage++
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="summary">
                <FileText className="mr-2 h-4 w-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="scores">
                <BarChart3 className="mr-2 h-4 w-4" />
                Scores
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
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
            </TabsContent>

            <TabsContent value="scores">
              <Card>
                <CardHeader>
                  <CardTitle>Section Scores</CardTitle>
                  <CardDescription>Average scores for each section of the survey (0-10 scale)</CardDescription>
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
            </TabsContent>
          </Tabs>

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
              <Button
                variant="outline"
                onClick={saveToDatabase}
                disabled={loading || !!error || !analysis || savingToDb || savedToDb}
              >
                {savingToDb ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : savedToDb ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Database
                  </>
                )}
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
