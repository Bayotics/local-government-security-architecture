"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { sections, calculateLSAr } from "@/lib/survey-data"

interface SurveyContextType {
  isHydrated: boolean
  answers: Record<string, string | string[]> // string for single select, string[] for multi-select
  setAnswer: (questionId: string, optionId: string) => void
  currentSectionIndex: number
  setCurrentSectionIndex: (index: number) => void
  isComplete: boolean
  canProceedToNextSection: (sectionIndex: number) => boolean
  getSectionScore: (sectionId: string) => number
  getOverallLSAr: () => number
  selectedState: string | null
  selectedLga: string | null
  setSelectedState: (state: string | null) => void
  setSelectedLga: (lga: string | null) => void
  getAnswersForQuestion: (questionId: string) => string[]
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({}) // Changed to string
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedLga, setSelectedLga] = useState<string | null>(null)

  // Initialize from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load answers
      const savedAnswers = localStorage.getItem("surveyAnswers")
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers))
        } catch (e) {
          console.error("Error parsing saved answers:", e)
          localStorage.removeItem("surveyAnswers")
        }
      }

      // Load section index
      const savedSectionIndex = localStorage.getItem("currentSectionIndex")
      if (savedSectionIndex) {
        try {
          setCurrentSectionIndex(Number.parseInt(savedSectionIndex))
        } catch (e) {
          console.error("Error parsing section index:", e)
        }
      }

      // Load location data
      const state = localStorage.getItem("selectedState")
      if (state) {
        setSelectedState(state)
      }

      const lga = localStorage.getItem("selectedLga")
      if (lga) {
        setSelectedLga(lga)
      }
    }

    setIsHydrated(true)
  }, [])

  // Save to localStorage when answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("surveyAnswers", JSON.stringify(answers))
    }
  }, [answers])

  // Save current section index to localStorage
  useEffect(() => {
    localStorage.setItem("currentSectionIndex", currentSectionIndex.toString())
  }, [currentSectionIndex])

  const setAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const question = sections.flatMap(s => s.questions).find(q => q.id === questionId)
      
      if (!question || !question.allowMultiple) {
        // Single select - original behavior
        const newAnswers = { ...prev, [questionId]: optionId }
        return newAnswers
      }

      // Multi-select logic
      const currentAnswers = prev[questionId] as string[] || []
      const selectedOption = question.options.find(opt => opt.id === optionId)
      const isUnsureOption = selectedOption?.text === "Unsure"
      
      const hasUnsure = currentAnswers.some(id => {
        const opt = question.options.find(opt => opt.id === id)
        return opt?.text === "Unsure"
      })

      if (isUnsureOption) {
        // User clicked Unsure - clear all other selections
        return { ...prev, [questionId]: [optionId] }
      }

      if (hasUnsure) {
        // Unsure is currently selected, remove it and add new option
        return { ...prev, [questionId]: [optionId] }
      }

      // Toggle regular option
      if (currentAnswers.includes(optionId)) {
        const updated = currentAnswers.filter(id => id !== optionId)
        return { ...prev, [questionId]: updated.length === 0 ? [] : updated }
      } else {
        return { ...prev, [questionId]: [...currentAnswers, optionId] }
      }
    })
  }

  const getAnswersForQuestion = (questionId: string): string[] => {
    const answer = answers[questionId]
    if (Array.isArray(answer)) {
      return answer
    }
    return answer ? [answer as string] : []
  }

  const getSectionScore = (sectionId: string): number => {
    const section = sections.find((s) => s.id === sectionId)
    if (!section) return 0

    let totalScore = 0
    let answeredQuestions = 0

    section.questions.forEach((question) => {
      const answerIds = getAnswersForQuestion(question.id)
      
      if (answerIds.length > 0) {
        if (question.allowMultiple) {
          // Multi-select question: always score 1 regardless of how many options selected
          // unless Unsure is selected, then score 0
          const hasUnsure = answerIds.some(id => {
            const opt = question.options.find(opt => opt.id === id)
            return opt?.text === "Unsure"
          })
          totalScore += hasUnsure ? 0 : 1
        } else {
          // Single select: original behavior - sum individual scores
          answerIds.forEach(selectedOptionId => {
            const selectedOption = question.options.find((opt) => opt.id === selectedOptionId)
            if (selectedOption) {
              totalScore += selectedOption.score
            }
          })
        }
        answeredQuestions++
      }
    })

    // If section total is negative, return 0 as per requirements
    if (totalScore < 0) return 0

    // Convert to percentage (out of 10 possible points)
    return answeredQuestions > 0 ? Math.max(0, (totalScore / answeredQuestions) * 10) : 0
  }

  const canProceedToNextSection = (sectionIndex: number): boolean => {
    const section = sections[sectionIndex]
    if (!section) return false

    // All questions in the section must be answered
    return section.questions.every((question) => answers[question.id] !== undefined)
  }

  const getOverallLSAr = (): number => {
    const sectionScores: Record<string, number> = {}
    sections.forEach((section) => {
      sectionScores[section.id] = getSectionScore(section.id)
    })
    return calculateLSAr(sectionScores)
  }

  const isComplete = sections.every((section) => {
    return section.questions.every((q) => answers[q.id] !== undefined)
  })

  return (
    <SurveyContext.Provider
      value={{
        isHydrated,
        answers,
        setAnswer,
        currentSectionIndex,
        setCurrentSectionIndex,
        isComplete,
        canProceedToNextSection,
        getSectionScore,
        getOverallLSAr,
        selectedState,
        selectedLga,
        setSelectedState,
        setSelectedLga,
        getAnswersForQuestion,
      }}
    >
      {children}
    </SurveyContext.Provider>
  )
}

export function useSurvey() {
  const context = useContext(SurveyContext)
  if (context === undefined) {
    throw new Error("useSurvey must be used within a SurveyProvider")
  }
  return context
}
