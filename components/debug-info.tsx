"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSurvey } from "@/context/survey-context"

export function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const { selectedState, selectedLga } = useSurvey()

  const localStorageState = typeof window !== "undefined" ? localStorage.getItem("selectedState") : null
  const localStorageLga = typeof window !== "undefined" ? localStorage.getItem("selectedLga") : null

  if (!showDebug) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-2 right-2 opacity-50 hover:opacity-100"
        onClick={() => setShowDebug(true)}
      >
        Debug
      </Button>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white p-4 max-w-sm text-xs z-50">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Debug Info</h3>
        <Button variant="ghost" size="sm" className="h-5 p-0" onClick={() => setShowDebug(false)}>
          Close
        </Button>
      </div>
      <div className="space-y-1">
        <p>Context State: {selectedState || "null"}</p>
        <p>Context LGA: {selectedLga || "null"}</p>
        <p>localStorage State: {localStorageState || "null"}</p>
        <p>localStorage LGA: {localStorageLga || "null"}</p>
      </div>
      <div className="mt-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("selectedState")
            localStorage.removeItem("selectedLga")
            window.location.reload()
          }}
        >
          Clear Location Data
        </Button>
      </div>
    </div>
  )
}
