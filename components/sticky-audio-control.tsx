"use client"

import { useAudio } from "@/context/audio-context"
import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"
import { useEffect, useState } from "react"

export function StickyAudioControl() {
  const { isPlaying, togglePlayPause, currentTrack } = useAudio()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Only show the button if music is or should be playing
  if (!currentTrack && !isPlaying) {
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
