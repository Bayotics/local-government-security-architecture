"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { SurveyProvider } from "@/context/survey-context"

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)

  // This ensures we only render the SurveyProvider on the client
  // to avoid hydration mismatches with localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return <SurveyProvider>{children}</SurveyProvider>
}
