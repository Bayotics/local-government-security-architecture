"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RatingSlider } from "@/components/rating-slider"
import { sections } from "@/lib/survey-data"
import { useSurvey } from "@/context/survey-context"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react"
import { DebugInfo } from "@/components/debug-info"
import { Navbar } from "@/components/navbar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SurveyPage() {
  const router = useRouter()
  const { answers, setAnswer, currentSectionIndex, setCurrentSectionIndex, isComplete, selectedState, selectedLga } =
    useSurvey()

  const [activeTab, setActiveTab] = useState(sections[currentSectionIndex]?.id || "")
  const [progress, setProgress] = useState(0)
  const [showCompletionAlert, setShowCompletionAlert] = useState(false)

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    // Check if location is selected and redirect if not
    // Add a small delay to ensure context is loaded
    const checkLocation = setTimeout(() => {
      // Get values directly from localStorage as a fallback
      const stateFromStorage = localStorage.getItem("selectedState")
      const lgaFromStorage = localStorage.getItem("selectedLga")

      const hasState = selectedState || stateFromStorage
      const hasLga = selectedLga || lgaFromStorage

      console.log("Location check:", {
        contextState: selectedState,
        contextLga: selectedLga,
        storageState: stateFromStorage,
        storageLga: lgaFromStorage,
      })

      if (!hasState || !hasLga) {
        console.log("Missing location data, redirecting to select-location")
        router.push("/select-location")
      } else if (!selectedState && stateFromStorage) {
        // If context doesn't have the values but localStorage does, reload the page
        // This helps with hydration issues
        window.location.reload()
      }
    }, 500)

    return () => clearTimeout(checkLocation)
  }, [selectedState, selectedLga, router])

  // Update progress
  useEffect(() => {
    const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0)
    const answeredQuestions = Object.keys(answers).length
    setProgress(Math.round((answeredQuestions / totalQuestions) * 100))
  }, [answers])

  // Update active tab when section changes
  useEffect(() => {
    setActiveTab(sections[currentSectionIndex]?.id || "")
  }, [currentSectionIndex])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const newIndex = sections.findIndex((section) => section.id === value)
    if (newIndex !== -1) {
      setCurrentSectionIndex(newIndex)
    }
  }

  // Navigate to next/previous section
  const goToNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    } else if (isComplete) {
      router.push("/survey/results")
    } else {
      // Show alert that not all sections have enough questions answered
      setShowCompletionAlert(true)
      setTimeout(() => setShowCompletionAlert(false), 5000)
    }
  }

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  // Check if current section is complete
  const isCurrentSectionComplete = () => {
    const currentSection = sections[currentSectionIndex]
    if (!currentSection) return false

    // Count how many questions have been explicitly answered (including zeros)
    const answeredQuestions = currentSection.questions.filter((q) => answers[q.id] !== undefined)

    // Allow proceeding if at least 3 questions are answered
    return answeredQuestions.length >= 3
  }

  // Count answered questions in each section
  const getSectionAnsweredCount = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return 0

    return section.questions.filter((q) => answers[q.id] !== undefined).length
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Security Awareness Survey</h1>
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 dark:text-slate-400">
                {selectedState}, {selectedLga}
              </p>
              <p className="text-slate-500 dark:text-slate-400">Progress: {progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {showCompletionAlert && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please answer at least 3 questions in each section before viewing results.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              {sections.map((section, index) => {
                const answeredCount = getSectionAnsweredCount(section.id)
                const isComplete = answeredCount >= 3

                return (
                  <TabsTrigger key={section.id} value={section.id} className="relative">
                    {section.title.split(" ")[0]}
                    {isComplete && <CheckCircle className="h-3 w-3 absolute top-0 right-0 text-green-500" />}
                    <span className="text-xs absolute bottom-0 right-1">{answeredCount}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {sections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                      Please answer at least 3 questions in this section. Currently answered:{" "}
                      {getSectionAnsweredCount(section.id)}/10
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {section.questions.map((question) => (
                        <div key={question.id} className="space-y-2">
                          <h3 className="font-medium">{question.text}</h3>
                          <RatingSlider
                            questionId={question.id}
                            value={answers[question.id] ?? 0}
                            onChange={(value) => setAnswer(question.id, value)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={goToPrevSection} disabled={currentSectionIndex === 0}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <Button onClick={goToNextSection} disabled={!isCurrentSectionComplete()}>
                      {currentSectionIndex < sections.length - 1 ? (
                        <>
                          Next
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "View Results"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
          <DebugInfo />
        </div>
      </div>
    </>
  )
}
