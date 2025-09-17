"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionOptions } from "@/components/question-options"
import { sections } from "@/lib/survey-data"
import { useSurvey } from "@/context/survey-context"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Lock } from "lucide-react"
import { DebugInfo } from "@/components/debug-info"
import { Navbar } from "@/components/navbar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SurveyPage() {
  const router = useRouter()
  const {
    answers,
    setAnswer,
    currentSectionIndex,
    setCurrentSectionIndex,
    isComplete,
    canProceedToNextSection,
    getSectionScore,
    selectedState,
    selectedLga,
  } = useSurvey()

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
    const checkLocation = setTimeout(() => {
      const stateFromStorage = localStorage.getItem("selectedState")
      const lgaFromStorage = localStorage.getItem("selectedLga")

      const hasState = selectedState || stateFromStorage
      const hasLga = selectedLga || lgaFromStorage

      if (!hasState || !hasLga) {
        router.push("/select-location")
      } else if (!selectedState && stateFromStorage) {
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

  // Handle tab change - only allow if previous sections are complete
  const handleTabChange = (value: string) => {
    const targetIndex = sections.findIndex((section) => section.id === value)
    if (targetIndex === -1) return

    // Check if user can access this section
    if (targetIndex > 0) {
      // Check if all previous sections are complete
      for (let i = 0; i < targetIndex; i++) {
        if (!canProceedToNextSection(i)) {
          setShowCompletionAlert(true)
          setTimeout(() => setShowCompletionAlert(false), 3000)
          return
        }
      }
    }

    setActiveTab(value)
    setCurrentSectionIndex(targetIndex)
  }

  // Navigate to next/previous section
  const goToNextSection = () => {
    if (!canProceedToNextSection(currentSectionIndex)) {
      setShowCompletionAlert(true)
      setTimeout(() => setShowCompletionAlert(false), 3000)
      return
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    } else if (isComplete) {
      router.push("/survey/results")
    }
  }

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    }
  }

  // Count answered questions in each section
  const getSectionAnsweredCount = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return 0
    return section.questions.filter((q) => answers[q.id] !== undefined).length
  }

  // Check if section is accessible
  const isSectionAccessible = (sectionIndex: number) => {
    if (sectionIndex === 0) return true
    // Check if all previous sections are complete
    for (let i = 0; i < sectionIndex; i++) {
      if (!canProceedToNextSection(i)) return false
    }
    return true
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-4 text-center">Local Security Architecture Assessment</h1>
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                📍 {selectedState}, {selectedLga}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Progress: <span className="font-bold text-blue-600">{progress}%</span>
              </p>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="origin-left"
            >
              <Progress value={progress} className="h-3 bg-slate-200 dark:bg-slate-700" />
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {showCompletionAlert && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please answer ALL questions in the current section before proceeding to the next section.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-6 h-auto p-1">
                {sections.map((section, index) => {
                  const answeredCount = getSectionAnsweredCount(section.id)
                  const isComplete = canProceedToNextSection(index)
                  const isAccessible = isSectionAccessible(index)
                  const sectionScore = getSectionScore(section.id)

                  return (
                    <TabsTrigger
                      key={section.id}
                      value={section.id}
                      className={`relative p-3 h-auto flex flex-col gap-1 ${
                        !isAccessible ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!isAccessible}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium truncate">
                          {section.tabHeader}
                        </span>
                        {!isAccessible && <Lock className="h-3 w-3" />}
                        {isComplete && <CheckCircle className="h-3 w-3 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{answeredCount}/10</span>
                        {isComplete && <span className="text-blue-600 font-medium">{Number(sectionScore.toFixed(0)) * 10}%</span>}
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              {sections.map((section, sectionIndex) => (
                <TabsContent key={section.id} value={section.id}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                      <CardHeader className="pb-4">
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                        >
                          <CardTitle className="text-xl text-balance">{section.title}</CardTitle>
                          <CardDescription className="text-base mt-2 text-pretty">
                            {section.description}
                          </CardDescription>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="text-muted-foreground">
                              Progress: {getSectionAnsweredCount(section.id)}/10 questions
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                canProceedToNextSection(sectionIndex)
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                              }`}
                            >
                              {canProceedToNextSection(sectionIndex) ? "Complete" : "In Progress"}
                            </span>
                          </div>
                        </motion.div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-8">
                          {section.questions.map((question, questionIndex) => (
                            <motion.div
                              key={question.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: questionIndex * 0.05 }}
                            >
                              <QuestionOptions
                                question={question}
                                selectedOptionId={answers[question.id]}
                                onChange={(optionId) => setAnswer(question.id, optionId)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-6">
                        <Button
                          variant="outline"
                          onClick={goToPrevSection}
                          disabled={currentSectionIndex === 0}
                          className="flex items-center gap-2 bg-transparent"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <Button
                          onClick={goToNextSection}
                          disabled={!canProceedToNextSection(currentSectionIndex)}
                          className="flex items-center gap-2"
                        >
                          {currentSectionIndex < sections.length - 1 ? (
                            <>
                              Next Section
                              <ChevronRight className="h-4 w-4" />
                            </>
                          ) : (
                            "View Results"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </AnimatePresence>
          </Tabs>
          <DebugInfo />
        </div>
      </div>
    </>
  )
}
