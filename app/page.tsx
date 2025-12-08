"use client"
import type { FC } from "react"
import type React from "react"

import { useEffect } from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import { Shield, Database, Brain, Users, TrendingUp, Lock, CheckCircle2, Award, Target, Zap } from "lucide-react"
import NigeriaMap from "@/components/nigeria-map-svg"
import PageLoader from "@/components/page-loader"
import ShinyRotatingBorderButton from "@/components/shiny-button"
import Header from "@/components/header"
import Footer from "@/components/footer"
import VideoPlayerPopup from "@/components/video-player-popup"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
}

const LandingPage: FC = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showRollingText, setShowRollingText] = useState(false)
  const [showImageMask, setShowImageMask] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const smoothWrapperRef = useRef<HTMLDivElement>(null)
  const smoothContentRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const fullAboutText = `National security is intimately impacted by the nature and state of security in sub-national entities and local areas of a nation. Local security is undergirded by the level of security preparedness and resilience, which mirrors the Local Security Architecture (LSA). The 6 components of the LSA are: security decision making; security regulations; security intelligence and early warning; dedicated resources for security provision; security institutions and response mechanisms; as well as security performance measurement and evaluation. A continuous track and measurement of these critical components in the LGAs will show the state of LSA and security preparedness. The Local Security Architecture Tracker (LSAT) is a web-based application designed to collect, analyze, visualize security data, and colour-code security preparedness assessment across Nigeria's 774 LGAs. The application enables government officials and security professionals, to assess security preparedness and resilience at the LGAs through standardized participant surveys, as well as Artificial Intelligence (AI) enabled analysis and advisory. This generates insights that can support security policy formulation in local areas, enable informed security decision making and prioritisation, cause prudent security resource allocation and ensure effective security interventions.`

  const shortAboutText = fullAboutText.slice(0, Math.floor(fullAboutText.length * 0.2)) + "..."

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setTimeout(() => setShowRollingText(true), 300)
    }, 2300)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showRollingText) {
      const timer = setTimeout(() => {
        setShowImageMask(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showRollingText])

  useEffect(() => {
    if (!isLoading && typeof window !== "undefined") {
      // Create smooth scroll effect
      // const smoother = ScrollSmoother.create({
      //   wrapper: smoothWrapperRef.current!,
      //   content: smoothContentRef.current!,
      //   smooth: 1.5,
      //   effects: true,
      //   smoothTouch: 0.1,
      // })
       document.documentElement.style.scrollBehavior = 'auto'

      // Hero headline scale and fade animation
      gsap.fromTo(
        ".hero-headline",
        {
          opacity: 0.3,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: ".hero-headline",
            start: "top 80%",
            end: "center center",
            scrub: 1,
          },
        },
      )

      // About section parallax
      gsap.to(".about-section", {
        y: -100,
        scrollTrigger: {
          trigger: ".about-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      })

      // Features section parallax
      gsap.to(".features-section", {
        y: -80,
        scrollTrigger: {
          trigger: ".features-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      })

      // Assessment dimensions parallax
      gsap.to(".dimensions-section", {
        y: -60,
        scrollTrigger: {
          trigger: ".dimensions-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      })

      // Feature cards stagger animation
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          scrollTrigger: {
            trigger: ".features-section",
            start: "top 70%",
            end: "top 30%",
            scrub: 1,
          },
        },
      )

      // Dimension cards animation
      gsap.fromTo(
        ".dimension-card",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".dimensions-section",
            start: "top 70%",
            end: "top 30%",
            scrub: 1,
          },
        },
      )

      return () => {
        // smoother.kill()
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      }
    }
  }, [isLoading])

  const heroText = "Empowering Nigeria's Security:"
  const letters = heroText.split("")

  return (
    <>
      <AnimatePresence>{isLoading && <PageLoader onLoadingComplete={() => setIsLoading(false)} />}</AnimatePresence>

      <Header />

      <div ref={smoothWrapperRef} id="smooth-wrapper" className="overflow-hidden">
        <div ref={smoothContentRef} id="smooth-content">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="min-h-screen bg-black text-white"
          >
            {/* Animated Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
              <motion.div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
              linear-gradient(rgba(100, 255, 218, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100, 255, 218, 0.1) 1px, transparent 1px)
            `,
                  backgroundSize: "50px 50px",
                }}
                animate={{
                  backgroundPosition: ["0px 0px", "50px 50px"],
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20 mt-1">
              <div className="max-w-7xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center mt-20">
                  {/* Left Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <motion.h1
                        className="hero-headline text-4xl lg:text-6xl font-bold leading-tight text-balance image-masked-text"
                        style={{
                          backgroundImage: "url('/nigeria-bg.jpg')",
                        }}
                        animate={{
                          backgroundPositionX: ["0%", "100%"],
                          backgroundPositionY: ["50%", "50%"],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          repeatType: "reverse",
                        }}
                      >
                        Local Security Architecture <span className="text-[#64FFDA]">Tracker</span>
                      </motion.h1>
                      <p className="text-xl lg:text-2xl text-gray-300 mt-6 text-pretty">for Every Local Government</p>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-lg text-gray-400 leading-relaxed"
                    >
                      Comprehensive security assessments across all 774 LGAs powered by AI-driven analysis and real-time
                      data collection.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <ShinyRotatingBorderButton />
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="text-sm text-gray-500 flex items-center gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 1.0 }}
                            className="w-8 h-8 rounded-full border-2 border-[#0A192F] overflow-hidden bg-gray-600"
                          >
                            <img src="/algon.jpeg" alt="Professional 1" className="w-full h-full object-cover" />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 1.1 }}
                            className="w-8 h-8 rounded-full border-2 border-[#0A192F] overflow-hidden bg-gray-600"
                          >
                            <img src="/onsa.jpg" alt="Professional 2" className="w-full h-full object-cover" />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 1.2 }}
                            className="w-8 h-8 rounded-full border-2 border-[#0A192F] overflow-hidden bg-gray-600"
                          >
                            <img src="/navy.jpeg" alt="Professional 3" className="w-full h-full object-cover" />
                          </motion.div>
                        </div>
                        Trusted by Security Professionals and Policy Makers
                      </div>
                    </motion.p>
                  </motion.div>

                  {/* Right Content - Interactive Nigeria Map */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative"
                  >
                    <div className="relative aspect-square max-w-lg mx-auto">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-[#64FFDA] to-[#0A192F] opacity-30 blur-3xl"
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />

                      <NigeriaMap />

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 }}
                        className="absolute top-10 left-0 bg-[#1E293B] border border-[#64FFDA]/30 rounded-lg px-4 py-2 backdrop-blur-sm z-10"
                      >
                        <p className="text-2xl font-normal text-[#64FFDA]">774</p>
                        <p className="text-xs text-gray-400">LGAs Covered</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 }}
                        className="absolute bottom-[7.5rem] right-[4rem] bg-[#1E293B] border border-[#64FFDA]/30 rounded-lg px-4 py-2 backdrop-blur-sm"
                      >
                        <p className="text-2xl font-normal text-[#64FFDA]">36</p>
                        <p className="text-xs text-gray-400">States + FCT</p>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            <section className="about-section relative py-20 px-4 bg-black">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <div className="space-y-6">
                    <span className="inline-flex items-center gap-2 text-sm text-[#64FFDA] font-medium">
                      <div className="w-2 h-2 rounded-full bg-[#64FFDA]"></div>
                      About
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-normal leading-tight">
                      Accurate Security Assessment for every LGA
                    </h2>
                    <p className="text-lg text-gray-400 leading-relaxed">{shortAboutText}</p>
                    <motion.button
                      onClick={() => setShowAboutModal(true)}
                      className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Learn More
                    </motion.button>
                  </div>

                  {/* Right Content - Interactive Visual */}
                  <div className="relative">
                    <div className="relative w-full max-w-md mx-auto">
                      {/* Central circular image */}
                      <div className="relative z-10 w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-[#64FFDA]/20">
                        <img src="/meeting.png" alt="Team meeting" className="w-full h-full object-cover" />
                      </div>

                      {/* Update Instantly badge - top left */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-[3.5rem] -left-4 bg-[#64FFDA] text-black px-6 py-3 rounded-full font-medium shadow-lg z-20 flex items-center gap-2"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                          className="flex items-center gap-2"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-yellow-600">
                            <path
                              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Update Instantly
                        </motion.div>
                      </motion.div>

                      {/* Assessment knowledge card - top right */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="absolute top-4 -right-8 bg-[#0D9488] rounded-xl p-4 shadow-xl z-20 w-48"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white text-sm font-medium">Assessment knowledge</span>
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white/20 rounded-lg p-3">
                          <img src="/analysis.png" alt="Analysis dashboard" className="w-full h-auto rounded" />
                        </div>
                      </motion.div>

                      {/* Generating Analysis indicator - bottom */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="absolute -bottom-[-0.5rem] left-[-15%] transform -translate-x-1/2 bg-white rounded-lg px-6 py-3 shadow-xl z-20 flex items-center gap-3 min-w-[260px]"
                      >
                        <Zap className="w-5 h-5 text-[#64FFDA] flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-black text-sm font-medium">Generating Analysis</span>
                          </div>

                          {/* Grey divider line */}
                          <div className="w-full px-2 my-2">
                            <div className="h-[1px] bg-gray-300"></div>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-xs font-medium">57%</span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                              animate={{
                                x: ["-100%", "200%"],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                              }}
                            />
                            <motion.div
                              className="bg-[#0D9488] h-2 rounded-full relative z-10"
                              initial={{ width: 0 }}
                              whileInView={{ width: "57%" }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.6 }}
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Background decoration */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#64FFDA]/5 to-transparent rounded-full blur-3xl -z-10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="features" className="features-section relative py-20 px-4">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-16"
                >
                  <h2 className="text-4xl lg:text-5xl font-medium mb-4">
                    Comprehensive Security <span className="text-[#64FFDA]">Assessment</span>
                  </h2>
                  <p className="text-xl text-gray-400">
                    Transform security data into actionable insights
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {/* Card 1 - Assessment Completion Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-2xl p-8 hover:border-[#64FFDA]/50 transition-all hover:shadow-xl hover:shadow-[#64FFDA]/10"
                  >
                    <div className="flex flex-col items-center justify-center space-y-6">
                      {/* Gauge visualization */}
                      <div className="relative w-48 h-28">
                        <svg viewBox="0 0 200 120" className="w-full h-full">
                          {/* Background arc */}
                          <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#1E293B"
                            strokeWidth="12"
                            strokeLinecap="round"
                          />
                          {/* Animated progress arc */}
                          <motion.path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#64FFDA"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray="251.2"
                            initial={{ strokeDashoffset: 251.2 }}
                            whileInView={{ strokeDashoffset: 251.2 * 0.28 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, ease: "easeOut" }}
                          />
                          {/* Segments */}
                          {[...Array(9)].map((_, i) => (
                            <motion.line
                              key={i}
                              x1={100 + 70 * Math.cos((Math.PI * (i + 1)) / 10 - Math.PI)}
                              y1={100 + 70 * Math.sin((Math.PI * (i + 1)) / 10 - Math.PI)}
                              x2={100 + 85 * Math.cos((Math.PI * (i + 1)) / 10 - Math.PI)}
                              y2={100 + 85 * Math.sin((Math.PI * (i + 1)) / 10 - Math.PI)}
                              stroke={i < 7 ? "#64FFDA" : "#1E293B"}
                              strokeWidth="4"
                              strokeLinecap="round"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                            />
                          ))}
                        </svg>
                        {/* Center number */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <span className="text-5xl font-bold text-[#64FFDA]">428</span>
                        </motion.div>
                      </div>

                      {/* Badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                        className="bg-[#64FFDA]/10 border border-[#64FFDA]/30 rounded-full px-4 py-1.5"
                      >
                        <span className="text-xs text-[#64FFDA] font-medium">Assessments completed</span>
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-xl font-medium text-center text-white pt-4">Completion Tracking</h3>
                      <p className="text-sm text-gray-400 text-center">
                        Real-time monitoring of LGA security assessments across the nation
                      </p>
                    </div>
                  </motion.div>

                  {/* Card 2 - AI-Powered Analysis */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-2xl p-8 hover:border-[#64FFDA]/50 transition-all hover:shadow-xl hover:shadow-[#64FFDA]/10"
                  >
                    <div className="flex flex-col items-center justify-center space-y-6 h-full">
                      {/* Icon and title */}
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-medium">
                          Generate with <span className="text-[#64FFDA]">AI Power</span>
                        </h3>
                      </div>

                      {/* Mock search input */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="w-full bg-[#1E293B] border border-[#64FFDA]/30 rounded-lg px-4 py-3 flex items-center justify-between group hover:border-[#64FFDA]/60 transition-all"
                      >
                        <span className="text-gray-400 text-sm">Analyze security trends...</span>
                        <motion.div whileHover={{ scale: 1.1, x: 3 }} className="text-[#64FFDA]">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </motion.div>
                      </motion.div>

                      {/* Bottom text */}
                      <div className="pt-4">
                        <h4 className="text-lg font-medium text-center text-white mb-2">AI-powered Analysis</h4>
                        <p className="text-sm text-gray-400 text-center">
                          Get instant security insights with natural language queries
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 3 - Stats & Analytics */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-2xl p-8 hover:border-[#64FFDA]/50 transition-all hover:shadow-xl hover:shadow-[#64FFDA]/10"
                  >
                    <div className="flex flex-col items-center justify-center space-y-6 h-full">
                      {/* Score display */}
                      <div className="flex items-baseline gap-2">
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.9 }}
                          className="text-5xl font-bold text-white"
                        >
                          87
                        </motion.span>
                        <span className="text-2xl text-gray-500">/</span>
                        <span className="text-2xl text-gray-500">100</span>
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 1.1 }}
                          className="ml-2 bg-[#64FFDA]/20 text-[#64FFDA] text-xs px-2 py-1 rounded"
                        >
                          vs last month
                        </motion.span>
                      </div>

                      {/* Graph visualization */}
                      <div className="w-full h-32 relative">
                        <svg viewBox="0 0 300 100" className="w-full h-full">
                          {/* Grid lines */}
                          {[...Array(5)].map((_, i) => (
                            <line key={i} x1="0" y1={20 * i} x2="300" y2={20 * i} stroke="#1E293B" strokeWidth="1" />
                          ))}
                          {/* Line chart */}
                          <motion.polyline
                            points="0,80 50,60 100,70 150,40 200,50 250,30 300,35"
                            fill="none"
                            stroke="#64FFDA"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            whileInView={{ pathLength: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                          />
                          {/* Gradient fill under line */}
                          <motion.path
                            d="M 0 80 L 50 60 L 100 70 L 150 40 L 200 50 L 250 30 L 300 35 L 300 100 L 0 100 Z"
                            fill="url(#gradient)"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.3 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 1 }}
                          />
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#64FFDA" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="#64FFDA" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Glowing end point */}
                          <motion.circle
                            cx="300"
                            cy="35"
                            r="5"
                            fill="#64FFDA"
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 2 }}
                          />
                          <motion.circle
                            cx="300"
                            cy="35"
                            r="8"
                            fill="none"
                            stroke="#64FFDA"
                            strokeWidth="2"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: [0, 0.8, 0] }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, delay: 2, repeat: Number.POSITIVE_INFINITY }}
                          />
                        </svg>
                      </div>

                      {/* Title */}
                      <div className="pt-2">
                        <h3 className="text-lg font-medium text-center text-white mb-2">Stats & Analytics</h3>
                        <p className="text-sm text-gray-400 text-center">
                          Track performance metrics and identify security trends
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            <section className="dimensions-section relative py-20 px-4 bg-[#1E293B]/30 overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-16"
                >
                  <h2 className="text-4xl lg:text-5xl font-medium mb-4">
                    Six Core <span className="text-[#64FFDA]">Dimensions</span>
                  </h2>
                  <p className="text-xl text-gray-400">Comprehensive security evaluation framework</p>
                </motion.div>

                {/* Main 3 feature cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                  {/* Card 1 - Decision Making */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-2xl p-8 hover:border-[#64FFDA]/50 transition-all hover:shadow-xl hover:shadow-[#64FFDA]/10"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-[#64FFDA]/10 rounded-2xl flex items-center justify-center">
                        <Target className="w-8 h-8 text-[#64FFDA]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-medium text-white">Security Decision Making</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Evaluate decision-making processes and governance structures for security management
                      </p>
                    </div>
                  </motion.div>

                  {/* Card 2 - Regulations */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-2xl p-8 hover:border-[#64FFDA]/50 transition-all hover:shadow-xl hover:shadow-[#64FFDA]/10"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-[#64FFDA]/10 rounded-2xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-[#64FFDA]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-medium text-white">Security Regulations</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Assess compliance with security laws, policies, and regulatory frameworks
                      </p>
                    </div>
                  </motion.div>

                  {/* Card 3 - Intelligence */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-2xl p-8 hover:border-[#64FFDA]/50 transition-all hover:shadow-xl hover:shadow-[#64FFDA]/10"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-[#64FFDA]/10 rounded-2xl flex items-center justify-center">
                        <Brain className="w-8 h-8 text-[#64FFDA]" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-medium text-white">Intelligence & Early Warning</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        Measure intelligence gathering capabilities and threat detection systems
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Infinite horizontal scroller */}
                <div className="relative">
                  {/* Gradient overlays for fade effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#1E293B]/100 via-[#1E293B]/80 to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#1E293B]/100 via-[#1E293B]/80 to-transparent z-10 pointer-events-none"></div>

                  <div className="overflow-hidden">
                    <motion.div
                      className="flex gap-6"
                      animate={{
                        x: [0, -1800],
                      }}
                      transition={{
                        x: {
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                          duration: 20, // Reduced from 30 to 20 for faster scrolling
                          ease: "linear",
                        },
                      }}
                    >
                      {/* First set of cards */}
                      {[
                        {
                          icon: Lock,
                          title: "Dedicated Resources",
                          desc: "Budget allocation and resource distribution",
                        },
                        {
                          icon: Users,
                          title: "Security Institutions",
                          desc: "Capacity of local security forces and agencies",
                        },
                        {
                          icon: Award,
                          title: "Performance Measurement",
                          desc: "Monitoring and evaluation of security outcomes",
                        },
                        {
                          icon: CheckCircle2,
                          title: "Response Mechanisms",
                          desc: "Emergency response and crisis management systems",
                        },
                        {
                          icon: TrendingUp,
                          title: "Community Engagement",
                          desc: "Citizen participation in security initiatives",
                        },
                        {
                          icon: Database,
                          title: "Data Management",
                          desc: "Collection and analysis of security information",
                        },
                      ].map((item, index) => (
                        <div
                          key={`first-${index}`}
                          className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-xl p-6 hover:border-[#64FFDA]/50 transition-all flex-shrink-0 w-[280px]"
                        >
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-[#64FFDA]/10 rounded-xl flex items-center justify-center">
                              <item.icon className="w-6 h-6 text-[#64FFDA]" />
                            </div>
                            <h4 className="text-base font-medium text-white">{item.title}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                      {/* Duplicate set for seamless loop */}
                      {[
                        {
                          icon: Lock,
                          title: "Dedicated Resources",
                          desc: "Budget allocation and resource distribution",
                        },
                        {
                          icon: Users,
                          title: "Security Institutions",
                          desc: "Capacity of local security forces and agencies",
                        },
                        {
                          icon: Award,
                          title: "Performance Measurement",
                          desc: "Monitoring and evaluation of security outcomes",
                        },
                        {
                          icon: CheckCircle2,
                          title: "Response Mechanisms",
                          desc: "Emergency response and crisis management systems",
                        },
                        {
                          icon: TrendingUp,
                          title: "Community Engagement",
                          desc: "Citizen participation in security initiatives",
                        },
                        {
                          icon: Database,
                          title: "Data Management",
                          desc: "Collection and analysis of security information",
                        },
                      ].map((item, index) => (
                        <div
                          key={`second-${index}`}
                          className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-xl p-6 hover:border-[#64FFDA]/50 transition-all flex-shrink-0 w-[280px]"
                        >
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="w-12 h-12 bg-[#64FFDA]/10 rounded-xl flex items-center justify-center">
                              <item.icon className="w-6 h-6 text-[#64FFDA]" />
                            </div>
                            <h4 className="text-base font-medium text-white">{item.title}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 px-4">
              <div className="max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="space-y-8"
                >
                  <h2 className="text-4xl lg:text-5xl font-medium">
                    Ready to Contribute to <span className="text-[#64FFDA]">Nigeria's Security?</span>
                  </h2>
                  <p className="text-xl text-gray-400">
                    Join security professionals and policy makers in building a comprehensive security database
                  </p>
                  <ShinyRotatingBorderButton />
                </motion.div>
              </div>
            </section>

            <Footer />
          </motion.div>
        </div>
      </div>

      <VideoPlayerPopup videoUrl="/placeholder-video.mp4" />

      {/* About Modal */}
      <AnimatePresence>
        {showAboutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowAboutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.4,
              }}
              className="relative max-w-4xl w-full bg-gradient-to-br from-[#0A192F] to-[#1E293B] rounded-2xl shadow-2xl overflow-hidden border border-[#64FFDA]/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(100, 255, 218, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(100, 255, 218, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: "30px 30px",
                  }}
                  animate={{
                    backgroundPosition: ["0px 0px", "30px 30px"],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
              </div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAboutModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>

              {/* Modal Content */}
              <div className="relative p-8 md:p-12 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="space-y-3">
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="inline-flex items-center gap-2 text-sm text-[#64FFDA] font-medium"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#64FFDA]"></div>
                      About the Initiative
                    </motion.span>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl md:text-4xl font-bold text-white"
                    >
                      Local Security Architecture <span className="text-[#64FFDA]">Tracker</span>
                    </motion.h2>
                  </div>

                  {/* Divider */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="h-px bg-gradient-to-r from-[#64FFDA] via-[#64FFDA]/50 to-transparent"
                  />

                  {/* Full Text Content */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="space-y-4 text-gray-300 leading-relaxed text-base md:text-lg"
                  >
                    {fullAboutText.split(". ").map((sentence, index) => (
                      <motion.p
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="text-justify"
                      >
                        {sentence}
                        {sentence !== fullAboutText.split(". ").slice(-1)[0] ? "." : ""}
                      </motion.p>
                    ))}
                  </motion.div>

                  {/* Key Highlights */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="grid md:grid-cols-3 gap-4 pt-6"
                  >
                    {[
                      { icon: Shield, label: "774 LGAs", desc: "Complete Coverage" },
                      { icon: Brain, label: "AI-Powered", desc: "Smart Analysis" },
                      { icon: Database, label: "Real-Time", desc: "Live Data" },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-[#64FFDA]/10 hover:border-[#64FFDA]/30 transition-all"
                      >
                        <item.icon className="w-8 h-8 text-[#64FFDA] mb-2" />
                        <p className="text-white font-semibold">{item.label}</p>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Action Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex justify-center pt-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAboutModal(false)}
                      className="bg-[#64FFDA] text-black px-8 py-3 rounded-full font-semibold hover:bg-[#64FFDA]/90 transition-colors"
                    >
                      Got it, thanks!
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default LandingPage
