"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X } from "lucide-react"

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
    `probe canPlayType(video/mp4; codecs="avc1.42E01E, mp4a.40.2")=${video.canPlayType(
      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
    )}`,
  ]

  return lines.join("\n")
}

interface VideoSectionProps {
  videoUrl?: string
  videoSources?: Array<{ src: string; type?: string }>
  thumbnailUrl?: string
}

export default function VideoSection({
  videoUrl,
  videoSources,
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorInfo, setErrorInfo] = useState<VideoErrorInfo | null>(null)
  const [showDiagnostics, setShowDiagnostics] = useState(false)

  const proxyUrl = "/api/how-it-works-video"
  const fallbackMp4Url =
    "https://github.com/Bayotics/local-government-security-architecture/releases/download/video/lsat-how-it-works-nigerian-voice.mp4"
  const envMp4Url = process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_MP4_URL || process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL

  const rawSources =
    videoSources && videoSources.length > 0
      ? videoSources
      : [
          { src: proxyUrl, type: "video/mp4" },
          ...(envMp4Url ? [{ src: envMp4Url, type: "video/mp4" }] : []),
          { src: videoUrl || fallbackMp4Url, type: "video/mp4" },
        ]

  const sources = rawSources.filter(
    (source, index, array) => array.findIndex((s) => s.src === source.src && s.type === source.type) === index,
  )

  const primaryUrl = sources[0]?.src

  const reportError = (video: HTMLVideoElement | null, reason?: string) => {
    const code = video?.error?.code
    const codeLabel = formatMediaErrorCode(code)

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

  return (
    <>
      {/* Video Thumbnail Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden group cursor-pointer"
        onClick={() => setIsPlaying(true)}
      >
        {/* Thumbnail Image */}
        <div className="relative aspect-video w-full">
          <img
            src="https://res.cloudinary.com/dvrpa1lyo/image/upload/v1765360751/video-thumbnail_zdckjb.png"
            alt="Security assessment demo video"
            className="w-full h-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300" />

          {/* Animated Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Glowing rings */}
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-[#34D399]/20 border-2 border-[#34D399]/40"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-[#34D399]/20 border-2 border-[#34D399]/40"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* Play Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 w-20 h-20 rounded-full bg-[#34D399] flex items-center justify-center shadow-2xl group-hover:bg-[#34D399]/90 transition-colors"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(52, 211, 153, 0.5)",
                    "0 0 40px rgba(52, 211, 153, 0.8)",
                    "0 0 20px rgba(52, 211, 153, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="w-full h-full rounded-full flex items-center justify-center"
              >
                <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
              </motion.div>
            </motion.div>
          </div>

          {/* Text Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white text-lg font-medium mb-1"
            >
              Watch How It Works
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-sm"
            >
              See how our security assessment platform transforms data into actionable insights
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Video Player Popup */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Video Player */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
                <video
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="w-full h-full"
                  onEnded={() => setIsPlaying(false)}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget
                    if (video.videoWidth === 0 || video.videoHeight === 0) {
                      reportError(video, "Video track appears unsupported (audio-only).")
                    }
                  }}
                  onError={(e) => reportError(e.currentTarget, "Video failed to decode/load.")}
                >
                  {sources.map((source) => (
                    <source key={`${source.src}-${source.type ?? "no-type"}`} src={source.src} type={source.type} />
                  ))}
                  Your browser does not support the video tag.
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
              </div>

              {/* Video Info */}
              <div className="mt-4 text-center">
                <p className="text-white text-sm opacity-70">Press ESC or click outside to close</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
