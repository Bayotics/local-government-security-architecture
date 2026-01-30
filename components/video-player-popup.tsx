"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react'

type VideoErrorInfo = {
  title: string
  message: string
  diagnostics?: string
}

function formatMediaErrorCode(code?: number | null) {
  switch (code) {
    case 1:
      return "MEDIA_ERR_ABORTED"
    case 2:
      return "MEDIA_ERR_NETWORK"
    case 3:
      return "MEDIA_ERR_DECODE"
    case 4:
      return "MEDIA_ERR_SRC_NOT_SUPPORTED"
    default:
      return "UNKNOWN"
  }
}

function buildDiagnostics(video: HTMLVideoElement, sources: Array<{ src: string; type?: string }>) {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "(no navigator)"
  const canPlay = (type?: string) => (type ? video.canPlayType(type) : "(no type)")

  const lines = [
    `userAgent=${ua}`,
    `currentSrc=${video.currentSrc || "(empty)"}`,
    `readyState=${video.readyState}`,
    `networkState=${video.networkState}`,
    `errorCode=${video.error?.code ?? "(none)"} (${formatMediaErrorCode(video.error?.code)})`,
    `videoWidth=${video.videoWidth}`,
    `videoHeight=${video.videoHeight}`,
    "sources:",
    ...sources.map((s) => `- ${s.type || "(no type)"} | canPlayType=${canPlay(s.type)} | ${s.src}`),
    // Common MP4 codec probe (baseline H.264 + AAC)
    `probe canPlayType(video/mp4; codecs="avc1.42E01E, mp4a.40.2")=${video.canPlayType(
      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
    )}`,
  ]

  return lines.join("\n")
}

interface VideoPlayerPopupProps {
  videoUrl?: string
  videoSources?: Array<{ src: string; type?: string }>
}

export default function VideoPlayerPopup({ videoUrl, videoSources }: VideoPlayerPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<VideoErrorInfo | null>(null)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  const modalVideoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<number | null>(null)

  const proxyUrl = "/api/how-it-works-video"
  const fallbackMp4Url =
    "https://github.com/Bayotics/local-government-security-architecture/releases/download/video/lsat-how-it-works-nigerian-voice.mp4"
  const envMp4Url = process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_MP4_URL || process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL

  const sources =
    videoSources && videoSources.length > 0
      ? videoSources
      : [
          { src: proxyUrl, type: "video/mp4" },
          ...(envMp4Url ? [{ src: envMp4Url, type: "video/mp4" }] : []),
          { src: videoUrl || fallbackMp4Url, type: "video/mp4" },
        ]

  const primaryUrl = sources[0]?.src

  const reportError = (video: HTMLVideoElement | null, reason?: string) => {
    const code = video?.error?.code
    const codeLabel = formatMediaErrorCode(code)

    // Default: most “works on Chrome but not Firefox/phones” issues are codec-related.
    let title = "This video can’t be played in this browser"
    let message =
      "This usually happens when the video is encoded with an unsupported codec (common: H.265/HEVC). Re-export as MP4 (H.264 + AAC) with ‘fast start’ enabled."

    if (codeLabel === "MEDIA_ERR_NETWORK") {
      message = "The video couldn’t be loaded due to a network/permissions issue. Check the URL and try again."
    } else if (codeLabel === "MEDIA_ERR_SRC_NOT_SUPPORTED") {
      message = "The browser does not support this video format or codec. Use MP4 (H.264 + AAC) or provide a WebM fallback."
    } else if (codeLabel === "MEDIA_ERR_DECODE") {
      message = "The video loaded but could not be decoded (codec not supported or file is corrupted). Use MP4 (H.264 + AAC)."
    }

    if (reason) {
      message = `${message}\n\nDetected: ${reason}`
    }

    const diagnostics = video ? buildDiagnostics(video, sources) : undefined
    console.error("[HowItWorksVideo] playback error", { code, codeLabel, reason, diagnostics })

    setHasError(true)
    setErrorInfo({ title, message, diagnostics })
  }

  useEffect(() => {
    if (previewVideoRef.current) {
      previewVideoRef.current.muted = true
      const playPromise = previewVideoRef.current.play()
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay may be blocked; ignore.
        })
      }
    }
  }, [])

  const handleOpenModal = () => {
    setIsOpen(true)
    setIsPlaying(false)
    setHasError(false)
    setErrorInfo(null)
    setShowDiagnostics(false)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setIsPlaying(false)
    setHasError(false)
    setErrorInfo(null)
    setShowDiagnostics(false)
    if (modalVideoRef.current) {
      modalVideoRef.current.pause()
      modalVideoRef.current.currentTime = 0
    }
  }

  const togglePlay = async () => {
    if (modalVideoRef.current) {
      if (isPlaying) {
        modalVideoRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          await modalVideoRef.current.play()
          setIsPlaying(true)
        } catch {
          reportError(modalVideoRef.current, "Playback was blocked or failed to start.")
          setIsPlaying(false)
        }
      }
    }
  }

  const toggleMute = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (modalVideoRef.current) {
      setCurrentTime(modalVideoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (modalVideoRef.current) {
      setDuration(modalVideoRef.current.duration)

      // Some browsers show “audio-only” when the video track codec is unsupported.
      if (modalVideoRef.current.videoWidth === 0 || modalVideoRef.current.videoHeight === 0) {
        reportError(modalVideoRef.current, "Video track appears unsupported (audio-only).")
      }
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleFullscreen = () => {
    if (modalVideoRef.current) {
      if (modalVideoRef.current.requestFullscreen) {
        modalVideoRef.current.requestFullscreen()
      }
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <>
      {/* Circular Preview Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="fixed bottom-8 right-8 z-40"
      >
        <motion.button
          onClick={handleOpenModal}
          className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#34D399] shadow-2xl shadow-[#34D399]/50 group cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <video
            ref={previewVideoRef}
            loop
            muted
            playsInline
            preload="metadata"
            onError={() => reportError(previewVideoRef.current, "Preview failed to load.")}
            className="w-full h-full object-cover"
          >
            {sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <motion.div
              className="text-white text-xs font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              How It Works
            </motion.div>
          </div>
          <motion.div
            className="absolute inset-0 border-4 border-[#34D399] rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.button>
      </motion.div>

      {/* Full Video Player Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              onMouseMove={handleMouseMove}
            >
              <video
                ref={modalVideoRef}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                playsInline
                preload="metadata"
                onError={() => reportError(modalVideoRef.current, "Video failed to decode/load.")}
              >
                {sources.map((source) => (
                  <source key={source.src} src={source.src} type={source.type} />
                ))}
              </video>

              {hasError && (errorInfo || primaryUrl) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center">
                  <div className="max-w-md">
                    <p className="text-white font-medium">{errorInfo?.title || "This video can’t be played in this browser."}</p>
                    <p className="text-white/70 text-sm mt-2 whitespace-pre-line">{errorInfo?.message || "Try opening it directly."}</p>

                    <div className="mt-4 flex items-center justify-center gap-3">
                      {primaryUrl && (
                        <a
                          href={primaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                        >
                          Open video
                        </a>
                      )}
                      {errorInfo?.diagnostics && (
                        <button
                          onClick={() => setShowDiagnostics((v) => !v)}
                          className="inline-flex px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                        >
                          {showDiagnostics ? "Hide details" : "Show details"}
                        </button>
                      )}
                    </div>

                    {showDiagnostics && errorInfo?.diagnostics && (
                      <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-black/40 p-3 text-left text-xs text-white/80 whitespace-pre-wrap">
                        {errorInfo.diagnostics}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Play Button Overlay */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                  >
                    <motion.div
                      className="w-20 h-20 bg-[#34D399] rounded-full flex items-center justify-center shadow-xl shadow-[#34D399]/50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-10 h-10 text-[#0A192F] ml-1" fill="currentColor" />
                    </motion.div>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Video Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6"
                  >
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#34D399] [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={togglePlay}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6 text-white" fill="currentColor" />
                          ) : (
                            <Play className="w-6 h-6 text-white" fill="currentColor" />
                          )}
                        </button>

                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                          {isMuted ? (
                            <VolumeX className="w-6 h-6 text-white" />
                          ) : (
                            <Volume2 className="w-6 h-6 text-white" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={handleFullscreen}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      >
                        <Maximize className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
