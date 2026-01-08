"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react"

export type AudioTrack = "popup" | "survey"

interface AudioContextType {
  // Playback control
  isPlaying: boolean
  currentTrack: AudioTrack | null
  togglePlayPause: () => void
  playTrack: (track: AudioTrack) => Promise<void>
  pauseTrack: (track: AudioTrack) => void
  pauseAll: () => void
  resumeTrack: (track: AudioTrack) => Promise<void>

  // Popup state management
  showPopup: boolean
  setShowPopup: (show: boolean) => void

  // Audio continuity
  saveAudioState: () => void
  restoreAudioState: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { readonly children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const popupAudioRef = useRef<HTMLAudioElement>(null)
  const surveyAudioRef = useRef<HTMLAudioElement>(null)

  // Initialize audio refs
  useEffect(() => {
    setIsMounted(true)

    if (typeof globalThis !== "undefined" && globalThis.window) {
      // Create and store audio elements for use throughout the app
      if (!popupAudioRef.current) {
        const popupAudio = new Audio("/images/asa-no-one-knows.mp3")
        popupAudio.loop = true
        popupAudio.preload = "auto"
        popupAudio.volume = 0.7
        popupAudioRef.current = popupAudio
      }

      if (!surveyAudioRef.current) {
        const surveyAudio = new Audio("/images/asa-eye-adaba.mp3")
        surveyAudio.loop = true
        surveyAudio.preload = "auto"
        surveyAudio.volume = 0.7
        surveyAudioRef.current = surveyAudio
      }

      // Restore audio state from localStorage if available
      restoreAudioState()
    }

    return () => {
      // Cleanup on unmount
      if (popupAudioRef.current) {
        popupAudioRef.current.pause()
      }
      if (surveyAudioRef.current) {
        surveyAudioRef.current.pause()
      }
    }
  }, [])

  // Switch audio based on popup state
  useEffect(() => {
    if (!isMounted) return

    const switchAudio = async () => {
      try {
        if (showPopup) {
          // Popup is showing: pause survey music, play popup music
          if (surveyAudioRef.current) {
            surveyAudioRef.current.pause()
          }
          if (popupAudioRef.current && isPlaying) {
            await popupAudioRef.current.play()
          }
          setCurrentTrack("popup")
        } else {
          // Popup is closed: pause popup music, play survey music
          if (popupAudioRef.current) {
            popupAudioRef.current.pause()
          }
          if (surveyAudioRef.current && isPlaying) {
            await surveyAudioRef.current.play()
          }
          setCurrentTrack("survey")
        }
      } catch (error) {
        console.error("Audio switch failed:", error)
      }
    }

    switchAudio()
  }, [showPopup, isPlaying, isMounted])

  const playTrack = useCallback(
    async (track: AudioTrack) => {
      try {
        const audioRef = track === "popup" ? popupAudioRef.current : surveyAudioRef.current
        if (audioRef) {
          setCurrentTrack(track)
          setIsPlaying(true)
          await audioRef.play()
        }
      } catch (error) {
        console.error(`Failed to play ${track} audio:`, error)
      }
    },
    []
  )

  const pauseTrack = useCallback((track: AudioTrack) => {
    const audioRef = track === "popup" ? popupAudioRef.current : surveyAudioRef.current
    if (audioRef) {
      audioRef.pause()
    }
  }, [])

  const pauseAll = useCallback(() => {
    if (popupAudioRef.current) {
      popupAudioRef.current.pause()
    }
    if (surveyAudioRef.current) {
      surveyAudioRef.current.pause()
    }
    setIsPlaying(false)
  }, [])

  const resumeTrack = useCallback(
    async (track: AudioTrack) => {
      try {
        const audioRef = track === "popup" ? popupAudioRef.current : surveyAudioRef.current
        if (audioRef) {
          setCurrentTrack(track)
          setIsPlaying(true)
          await audioRef.play()
        }
      } catch (error) {
        console.error(`Failed to resume ${track} audio:`, error)
      }
    },
    []
  )

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      pauseAll()
    } else if (currentTrack) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      resumeTrack(currentTrack)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      playTrack("survey")
    }
  }, [isPlaying, currentTrack, pauseAll, resumeTrack, playTrack])

  const saveAudioState = useCallback(() => {
    if (typeof globalThis !== "undefined" && globalThis.window) {
      const state = {
        isPlaying,
        currentTrack,
        popupTime: popupAudioRef.current?.currentTime || 0,
        surveyTime: surveyAudioRef.current?.currentTime || 0,
      }
      localStorage.setItem("audioState", JSON.stringify(state))
    }
  }, [isPlaying, currentTrack])

  const restoreAudioState = useCallback(() => {
    if (typeof globalThis === "undefined" || !globalThis.window) return
    
    try {
      const savedState = localStorage.getItem("audioState")
      if (!savedState) return

      const state = JSON.parse(savedState)
      restoreAudioPositions(state)
      restorePlaybackState(state)
    } catch (error) {
      console.error("Failed to restore audio state:", error)
    }
  }, [])

  const restoreAudioPositions = (state: Record<string, unknown>) => {
    if (popupAudioRef.current) {
      popupAudioRef.current.currentTime = (state.popupTime as number) || 0
    }
    if (surveyAudioRef.current) {
      surveyAudioRef.current.currentTime = (state.surveyTime as number) || 0
    }
  }

  const restorePlaybackState = (state: Record<string, unknown>) => {
    if (state.isPlaying && state.currentTrack) {
      setIsPlaying(true)
      setCurrentTrack(state.currentTrack as AudioTrack)
    }
  }

  const contextValue = useMemo(
    () => ({
      isPlaying,
      currentTrack,
      togglePlayPause,
      playTrack,
      pauseTrack,
      pauseAll,
      resumeTrack,
      showPopup,
      setShowPopup,
      saveAudioState,
      restoreAudioState,
    }),
    [
      isPlaying,
      currentTrack,
      togglePlayPause,
      playTrack,
      pauseTrack,
      pauseAll,
      resumeTrack,
      showPopup,
      saveAudioState,
      restoreAudioState,
    ]
  )

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
