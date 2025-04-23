"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { sections } from "@/lib/survey-data"

interface SurveyContextType {
  answers: Record<string, number>
  setAnswer: (questionId: string, value: number) => void
  currentSectionIndex: number
  setCurrentSectionIndex: (index: number) => void
  isComplete: boolean
  selectedState: string | null
  selectedLga: string | null
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined)

export function SurveyProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
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

  const setAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: value }
      return newAnswers
    })
  }

  // Calculate if all sections have at least 3 questions answered
  const isComplete = sections.every((section) => {
    // Count how many questions have been answered in this section
    const answeredQuestions = section.questions.filter((q) => answers[q.id] !== undefined)
    // Section is complete if at least 3 questions are answered
    return answeredQuestions.length >= 3
  })

  return (
    <SurveyContext.Provider
      value={{
        answers,
        setAnswer,
        currentSectionIndex,
        setCurrentSectionIndex,
        isComplete,
        selectedState,
        selectedLga,
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
