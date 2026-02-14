"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QuestionOptions } from "@/components/question-options"
import { sections } from "@/lib/survey-data"
import { useSurvey } from "@/context/survey-context"
import { useAudio } from "@/context/audio-context"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { SectionQuotationPopup } from "@/components/section-quotation-popup"

const QUESTIONS_PER_PAGE = 5

export default function SurveyPage() {
  const router = useRouter()
  const {
    isHydrated,
    answers,
    setAnswer,
    currentSectionIndex,
    setCurrentSectionIndex,
    isComplete,
    selectedState,
    selectedLga,
    getAnswersForQuestion,
  } = useSurvey()
  const { playTrack, setShowPopup, saveAudioState } = useAudio()

  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showQuotation, setShowQuotation] = useState(true)
  const [hasShownQuotation, setHasShownQuotation] = useState<Set<number>>(new Set())
  const questionsPerPage = 5
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !isHydrated) return

    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!selectedState || !selectedLga) {
      router.push("/select-location")
    }
  }, [isMounted, isHydrated, selectedState, selectedLga, router])

  useEffect(() => {
    router.prefetch("/survey/results")
  }, [router])

  useEffect(() => {
    if (!isMounted) return
    if (hasShownQuotation.has(currentSectionIndex)) {
      setShowQuotation(false)
      // When quotation is not shown, play survey audio
      setShowPopup(false)
      playTrack("survey")
    } else {
      setShowQuotation(true)
      // When quotation shows, play popup audio
      setShowPopup(true)
      playTrack("popup")
    }
  }, [currentSectionIndex, hasShownQuotation, isMounted, playTrack, setShowPopup])

  useEffect(() => {
    const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0)
    const answeredQuestions = Object.keys(answers).length
    setProgress(Math.round((answeredQuestions / totalQuestions) * 100))
  }, [answers])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPageIndex, currentSectionIndex])

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

  const currentSection = sections[currentSectionIndex]
  const totalQuestionsInSection = currentSection?.questions.length || 0
  const startIndex = currentPageIndex * questionsPerPage
  const endIndex = Math.min(startIndex + questionsPerPage, totalQuestionsInSection)
  const currentQuestions = currentSection?.questions.slice(startIndex, endIndex) || []
  const totalPages = Math.ceil(totalQuestionsInSection / questionsPerPage)

  const areCurrentQuestionsAnswered = currentQuestions.every((question) => answers[question.id] !== undefined)

  const handleQuotationContinue = () => {
    setShowQuotation(false)
    setShowPopup(false) // Close popup state
    setHasShownQuotation((prev) => new Set(prev).add(currentSectionIndex))
    playTrack("survey") // Start playing survey audio
  }

  const goToNextPage = () => {
    if (!areCurrentQuestionsAnswered) return

    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
      return
    }

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentPageIndex(0)
    } else if (isComplete) {
      setIsNavigating(true)
      router.push("/survey/results")
    }
  }

  const isLastPage = currentSectionIndex === sections.length - 1 && currentPageIndex === totalPages - 1

  const getNextButtonContent = () => {
    if (isLastPage) {
      if (isNavigating) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Results...
          </>
        )
      }
      return "View Results"
    }
    return (
      <>
        Next Page
        <ChevronRight className="h-4 w-4" />
      </>
    )
  }

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      const prevSection = sections[currentSectionIndex - 1]
      const prevSectionPages = Math.ceil(prevSection.questions.length / questionsPerPage)
      setCurrentPageIndex(prevSectionPages - 1)
    }
  }

  const canGoToPrevious = currentSectionIndex > 0 || currentPageIndex > 0

  const getOverallQuestionNumber = () => {
    let totalQuestions = 0
    for (let i = 0; i < currentSectionIndex; i++) {
      totalQuestions += sections[i].questions.length
    }
    return totalQuestions + startIndex + 1
  }

  const totalQuestions = sections.reduce((total, section) => total + section.questions.length, 0)

  if (!currentSection || currentQuestions.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Navbar />
      <SectionQuotationPopup
        isOpen={showQuotation}
        sectionTitle={currentSection.title}
        sectionId={currentSection.id}
        onContinue={handleQuotationContinue}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
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

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentSectionIndex}-${currentPageIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full min-w-fit">
                        Section {currentSectionIndex + 1}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPageIndex + 1} of {totalPages}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Questions {getOverallQuestionNumber()}-
                      {Math.min(getOverallQuestionNumber() + currentQuestions.length - 1, totalQuestions)} of{" "}
                      {totalQuestions}
                    </span>
                  </div>
                  <CardTitle className="text-2xl text-balance mb-2">{currentSection.title}</CardTitle>
                  <CardDescription className="text-base text-pretty">{currentSection.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {currentQuestions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-6 last:pb-0"
                    >
                      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
                        {/* Question Section */}
                        <div className="w-full lg:w-2/5 flex-shrink-0">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full min-w-fit">
                              Q{startIndex + index + 1}
                            </span>
                            <h3 className="text-base lg:text-lg font-bold text-balance leading-relaxed flex-1">
                              {question.text}
                            </h3>
                          </div>
                        </div>

                        {/* Options Section */}
                        <div className="w-full lg:w-3/5 flex-shrink-0 pr-5">
                          <QuestionOptions
                            question={question}
                            selectedOptionId={
                              question.allowMultiple ? undefined : (answers[question.id] as string)
                            }
                            selectedOptionIds={
                              question.allowMultiple ? getAnswersForQuestion(question.id) : undefined
                            }
                            onChange={(optionId) => setAnswer(question.id, optionId)}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>

                <CardFooter className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={!canGoToPrevious}
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Page
                  </Button>

                  <div className="flex items-center gap-4">
                    {areCurrentQuestionsAnswered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">All Answered</span>
                      </motion.div>
                    )}

                    <Button
                      onClick={goToNextPage}
                      disabled={!areCurrentQuestionsAnswered || isNavigating}
                      className="flex items-center gap-2"
                    >
                      {getNextButtonContent()}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* <DebugInfo /> */}
        </div>
      </div>
    </>
  )
}
