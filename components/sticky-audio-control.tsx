"use client"

import { useAudio } from "@/context/audio-context"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"
import { useEffect, useState } from "react"

export function StickyAudioControl() {
  const { isPlaying, togglePlayPause, currentTrack } = useAudio()
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Don't show on homepage (/) or any page where audio shouldn't be playing
  const isLGALogin = pathname === "/lga-login"
  const isSelectLocation = pathname === "/select-location"
  const isSurvey = pathname === "/survey"
  const isResults = pathname === "/survey/results"

  // Only show on pages where audio is actively managed
  const shouldShow = (isLGALogin || isSelectLocation || isSurvey || isResults) && currentTrack

  if (!shouldShow) {
    return null
  }

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Button
        onClick={togglePlayPause}
        size="lg"
        className="rounded-full w-16 h-16 p-0 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title={isPlaying ? "Pause music" : "Play music"}
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
      </Button>
    </div>
  )
}
