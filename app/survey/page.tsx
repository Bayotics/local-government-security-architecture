"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuestionOptions } from "@/components/question-options"
import { sections } from "@/lib/survey-data"
import { useSurvey } from "@/context/survey-context"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { DebugInfo } from "@/components/debug-info"
import { Navbar } from "@/components/navbar"

export default function SurveyPage() {
  const router = useRouter()
  const {
    answers,
    setAnswer,
    currentSectionIndex,
    setCurrentSectionIndex,
    isComplete,
    canProceedToNextSection,
    selectedState,
    selectedLga,
  } = useSurvey()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [progress, setProgress] = useState(0)

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

  const currentSection = sections[currentSectionIndex]
  const currentQuestion = currentSection?.questions[currentQuestionIndex]
  const totalQuestionsInSection = currentSection?.questions.length || 0

  const isCurrentQuestionAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false

  const goToNextQuestion = () => {
    if (!isCurrentQuestionAnswered) return

    if (currentQuestionIndex < totalQuestionsInSection - 1) {
      // Move to next question in current section
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Move to next section or results
      if (currentSectionIndex < sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1)
        setCurrentQuestionIndex(0)
      } else if (isComplete) {
        router.push("/survey/results")
      }
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Move to previous question in current section
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSectionIndex > 0) {
      // Move to previous section, last question
      setCurrentSectionIndex(currentSectionIndex - 1)
      const prevSection = sections[currentSectionIndex - 1]
      setCurrentQuestionIndex(prevSection.questions.length - 1)
    }
  }

  const canGoToPrevious = currentSectionIndex > 0 || currentQuestionIndex > 0

  const getOverallQuestionNumber = () => {
    let totalQuestions = 0
    for (let i = 0; i < currentSectionIndex; i++) {
      totalQuestions += sections[i].questions.length
    }
    return totalQuestions + currentQuestionIndex + 1
  }

  const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0)

  if (!currentSection || !currentQuestion) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {/* <h1 className="text-3xl font-bold mb-4 text-center">Local Security Architecture Assessment</h1> */}
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

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentSectionIndex}-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm min-h-[600px] flex flex-col">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        {currentSection.tabHeader}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of {totalQuestionsInSection}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Overall: {getOverallQuestionNumber()} of {totalQuestions}
                    </span>
                  </div>
                  <CardTitle className="text-2xl text-balance mb-2">{currentSection.title}</CardTitle>
                  <CardDescription className="text-base text-pretty">{currentSection.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-center">
                  <div className="max-w-3xl mx-auto w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-center mb-8"
                    >
                      <h2 className="text-2xl font-bold text-balance mb-6 leading-relaxed">{currentQuestion.text}</h2>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <QuestionOptions
                        question={currentQuestion}
                        selectedOptionId={answers[currentQuestion.id]}
                        onChange={(optionId) => setAnswer(currentQuestion.id, optionId)}
                      />
                    </motion.div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={!canGoToPrevious}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Question
                  </Button>

                  <div className="flex items-center gap-4">
                    {isCurrentQuestionAnswered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Answered</span>
                      </motion.div>
                    )}

                    <Button
                      onClick={goToNextQuestion}
                      disabled={!isCurrentQuestionAnswered}
                      className="flex items-center gap-2"
                    >
                      {currentSectionIndex === sections.length - 1 &&
                      currentQuestionIndex === totalQuestionsInSection - 1 ? (
                        "View Results"
                      ) : (
                        <>
                          Next Question
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>

          <DebugInfo />
        </div>
      </div>
    </>
  )
}
