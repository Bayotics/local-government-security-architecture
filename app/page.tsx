"use client"
import type { FC } from "react"
import type React from "react"

import { useEffect } from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import { Shield, Database, MapPin, Brain, Users, TrendingUp, Lock, CheckCircle2 } from "lucide-react"
import NigeriaMap from "@/components/nigeria-map-svg"
import PageLoader from "@/components/page-loader"

const LandingPage: FC = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showRollingText, setShowRollingText] = useState(false)
  const [showImageMask, setShowImageMask] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

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
      }, 2000) // Match the total rolling animation duration
      return () => clearTimeout(timer)
    }
  }, [showRollingText])

  const heroText = "Empowering Nigeria's Security:"
  const letters = heroText.split("")

  return (
    <>
      <AnimatePresence>{isLoading && <PageLoader onLoadingComplete={() => setIsLoading(false)} />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="min-h-screen bg-[#0A192F] text-white overflow-hidden"
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
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                    className="text-4xl lg:text-6xl font-bold leading-tight text-balance image-masked-text"
                    style={{
                      backgroundImage: "url('/nigeria-bg.jpg')",
                    }}
                    animate={{
                      backgroundPositionX: ["0%", "100%"], // horizontal movement
                      backgroundPositionY: ["50%", "50%"], // keep vertical stable
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatType: "reverse",
                    }}
                  >
                    Empowering Nigeria’s Security: <span className="text-[#64FFDA]">Data-Driven Insights</span>
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
                  <motion.button
                    onClick={() => router.push("/survey-access")}
                    onMouseMove={handleMouseMove}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-[#64FFDA] hover:bg-[#52d4ba] text-[#0A192F] font-semibold text-lg px-8 py-6 rounded-lg transition-colors overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle 100px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.3), transparent)`,
                      }}
                    />
                    <motion.span
                      className="relative z-10 block"
                      animate={{
                        textShadow: [
                          "0 0 20px rgba(10, 25, 47, 0.3), 0 0 40px rgba(10, 25, 47, 0.2), 0 0 60px rgba(10, 25, 47, 0.1)",
                          "0 0 30px rgba(10, 25, 47, 0.5), 0 0 60px rgba(10, 25, 47, 0.3), 0 0 90px rgba(10, 25, 47, 0.2)",
                          "0 0 20px rgba(10, 25, 47, 0.3), 0 0 40px rgba(10, 25, 47, 0.2), 0 0 60px rgba(10, 25, 47, 0.1)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      Take Survey Now
                    </motion.span>

                    {/* Multi-layered glow effects */}
                    <motion.div
                      className="absolute inset-0 rounded-lg pointer-events-none"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(100, 255, 218, 0.5), 0 0 40px rgba(100, 255, 218, 0.3), 0 0 60px rgba(100, 255, 218, 0.1)",
                          "0 0 30px rgba(100, 255, 218, 0.7), 0 0 60px rgba(100, 255, 218, 0.5), 0 0 90px rgba(100, 255, 218, 0.3)",
                          "0 0 20px rgba(100, 255, 218, 0.5), 0 0 40px rgba(100, 255, 218, 0.3), 0 0 60px rgba(100, 255, 218, 0.1)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.button>

                  <Button
                    onClick={() => {
                      document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                    }}
                    variant="outline"
                    className="border-2 border-[#64FFDA] text-[#64FFDA] hover:bg-[#64FFDA]/10 font-semibold text-lg px-8 py-6 rounded-lg"
                  >
                    Learn More
                  </Button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-sm text-gray-500 flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Trusted by Security Professionals and Policy Makers
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
                  {/* Glowing border effect */}
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

                  {/* Nigeria Map Representation */}
                  <NigeriaMap />

                  {/* Stat badges */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                    className="absolute top-10 left-0 bg-[#1E293B] border border-[#64FFDA]/30 rounded-lg px-4 py-2 backdrop-blur-sm z-10"
                  >
                    <p className="text-2xl font-bold text-[#64FFDA]">774</p>
                    <p className="text-xs text-gray-400">LGAs Covered</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                    className="absolute bottom-10 right-0 bg-[#1E293B] border border-[#64FFDA]/30 rounded-lg px-4 py-2 backdrop-blur-sm"
                  >
                    <p className="text-2xl font-bold text-[#64FFDA]">36</p>
                    <p className="text-xs text-gray-400">States + FCT</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Comprehensive Security <span className="text-[#64FFDA]">Assessment</span>
              </h2>
              <p className="text-xl text-gray-400">Multi-dimensional analysis across key security domains</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Analysis",
                  description:
                    "Automated security assessments with intelligent pattern recognition and predictive insights",
                  color: "#64FFDA",
                },
                {
                  icon: MapPin,
                  title: "Granular Geographic Data",
                  description: "Detailed mapping and visualization across all 774 local government areas",
                  color: "#64FFDA",
                },
                {
                  icon: Database,
                  title: "Real-Time Data Collection",
                  description: "Live survey responses with instant aggregation and comparative analysis",
                  color: "#64FFDA",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="bg-[#1E293B] border border-[#64FFDA]/20 rounded-xl p-8 hover:border-[#64FFDA]/50 transition-all hover:shadow-lg hover:shadow-[#64FFDA]/20"
                >
                  <div className="mb-6">
                    <div className="inline-flex p-4 bg-[#64FFDA]/10 rounded-lg">
                      <feature.icon className="h-8 w-8" style={{ color: feature.color }} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Assessment Dimensions Section */}
        <section className="relative py-20 px-4 bg-[#1E293B]/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Six Core <span className="text-[#64FFDA]">Dimensions</span>
              </h2>
              <p className="text-xl text-gray-400">Holistic security evaluation framework</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: "Authority & Legitimacy", desc: "Trust in security institutions" },
                { icon: Users, title: "Community Resilience", desc: "Local capacity and cohesion" },
                { icon: Lock, title: "Physical Security", desc: "Infrastructure and protection" },
                { icon: TrendingUp, title: "Economic Security", desc: "Livelihood and stability" },
                { icon: Brain, title: "Information Security", desc: "Data and communication safety" },
                { icon: CheckCircle2, title: "Service Delivery", desc: "Access to essential services" },
              ].map((dimension, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-[#0A192F] border border-[#64FFDA]/20 rounded-lg p-6 hover:border-[#64FFDA]/50 transition-all"
                >
                  <dimension.icon className="h-6 w-6 text-[#64FFDA] mb-3" />
                  <h4 className="text-lg font-semibold mb-2">{dimension.title}</h4>
                  <p className="text-sm text-gray-400">{dimension.desc}</p>
                </motion.div>
              ))}
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
              <h2 className="text-4xl lg:text-5xl font-bold">
                Ready to Contribute to <span className="text-[#64FFDA]">Nigeria's Security?</span>
              </h2>
              <p className="text-xl text-gray-400">
                Join security professionals and policy makers in building a comprehensive security database
              </p>
              <motion.button
                onClick={() => router.push("/survey-access")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-[#64FFDA] hover:bg-[#52d4ba] text-[#0A192F] font-semibold text-lg px-12 py-6 rounded-lg transition-colors"
              >
                <motion.span
                  className="relative z-10"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(100, 255, 218, 0.3), 0 0 40px rgba(100, 255, 218, 0.2)",
                      "0 0 30px rgba(100, 255, 218, 0.5), 0 0 60px rgba(100, 255, 218, 0.3)",
                      "0 0 20px rgba(100, 255, 218, 0.3), 0 0 40px rgba(100, 255, 218, 0.2)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  Start Survey Now
                </motion.span>

                <motion.div
                  className="absolute inset-0 rounded-lg"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(100, 255, 218, 0.5), 0 0 40px rgba(100, 255, 218, 0.3), 0 0 60px rgba(100, 255, 218, 0.1)",
                      "0 0 30px rgba(100, 255, 218, 0.7), 0 0 60px rgba(100, 255, 218, 0.5), 0 0 90px rgba(100, 255, 218, 0.3)",
                      "0 0 20px rgba(100, 255, 218, 0.5), 0 0 40px rgba(100, 255, 218, 0.3), 0 0 60px rgba(100, 255, 218, 0.1)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </>
  )
}

export default LandingPage
