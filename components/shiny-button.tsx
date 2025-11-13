"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { ArrowRight } from "lucide-react"

export default function ShinyRotatingBorderButton({
  text = "Take Survey Now",
}: {
  text?: string
}) {
  const [angle, setAngle] = useState(0)
  const [hovered, setHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 })

  // Calculate arrow's position inside the button (for expansion origin)
  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const arrowEl = buttonRef.current.querySelector(".arrow-wrapper") as HTMLElement
        if (arrowEl) {
          const arrowRect = arrowEl.getBoundingClientRect()
          setCirclePosition({
            x: arrowRect.left + arrowRect.width / 2 - rect.left,
            y: arrowRect.top + arrowRect.height / 2 - rect.top,
          })
        }
      }
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    return () => window.removeEventListener("resize", updatePosition)
  }, [])

  // Continuous border rotation
  useEffect(() => {
    let frameId: number
    const animate = () => {
      setAngle((prev) => (prev + 1.2) % 360)
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <div
      className="relative inline-flex p-[2px] rounded-[2rem] overflow-hidden cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 rounded-[2rem]"
        style={{
          background: `conic-gradient(from ${angle}deg, rgba(168,239,255,0.1), rgba(168,239,255,1) 0.1turn, rgba(168,239,255,1) 0.15turn, rgba(168,239,255,0.1) 0.25turn)`,
          filter: "blur(2px)",
        }}
      ></motion.div>

      {/* Main button */}
      <button
        ref={buttonRef}
        className="relative z-10 flex items-center justify-center gap-3 rounded-[2rem] bg-[#0a0c12] text-white font-medium px-6 py-3 text-lg tracking-wide overflow-hidden"
      >
        {/* Expanding white overlay originating from arrow */}
        <motion.div
          className="absolute z-0 rounded-full bg-white"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{
            scale: hovered ? 15 : 0,
            opacity: hovered ? 1 : 0.6,
            x: circlePosition.x - 32, // 32 ~ half arrow wrapper width
            y: circlePosition.y - 32, // aligns center
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            width: 64,
            height: 64,
            transformOrigin: "center",
          }}
        />

        {/* Button Text */}
        <span
          className={`relative z-10 transition-colors duration-500 ${
            hovered ? "text-black" : "text-white"
          }`}
        >
          {text}
        </span>

        {/* Arrow Wrapper */}
        <motion.div
          className="arrow-wrapper relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white transition-all duration-500"
          animate={{
            backgroundColor: hovered ? "black" : "white",
            rotate: hovered ? -45 : 0,
            scale: hovered ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <ArrowRight
            size={18}
            color={hovered ? "white" : "black"}
            strokeWidth={2.5}
          />
        </motion.div>
      </button>

      {/* Mask layer to confine the border */}
      <div className="absolute inset-[3px] bg-[#0a0c12] rounded-[2rem] z-0"></div>
    </div>
  )
}
