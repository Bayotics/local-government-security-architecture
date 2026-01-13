"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, X } from "lucide-react"

interface VideoSectionProps {
  videoUrl?: string
  thumbnailUrl?: string
}

export default function VideoSection({
  videoUrl = "https://github.com/Bayotics/local-government-security-architecture/releases/download/video-update/copy_AC733518-42AB-4018-BD7B-E005EC819E1C.mov",
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false)

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
                <video src={videoUrl} controls autoPlay className="w-full h-full" onEnded={() => setIsPlaying(false)}>
                  Your browser does not support the video tag.
                </video>
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
