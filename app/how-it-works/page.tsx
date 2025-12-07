"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"

gsap.registerPlugin(ScrollTrigger)

export default function HowItWorksPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const step1Ref = useRef<HTMLDivElement>(null)
  const step2Ref = useRef<HTMLDivElement>(null)
  const step3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })

      // Step cards stagger animation
      gsap.from([step1Ref.current, step2Ref.current, step3Ref.current], {
        opacity: 0,
        y: 100,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: step1Ref.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <motion.section ref={heroRef} style={{ opacity, scale }} className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="inline-block mb-6"
          >
            <span className="px-6 py-2 rounded-full bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399] text-sm font-medium">
              Get Started
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-foreground"
          >
            Assess your LGA security
            <br />
            in just <span className="text-[#34D399]">3 easy steps</span>
          </motion.h1>
        </div>
      </motion.section>

      {/* Steps Section */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Step 1 */}
            <motion.div
              ref={step1Ref}
              whileHover={{ y: -10 }}
              className="relative rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 p-8 md:p-12 overflow-hidden"
            >
              <div className="relative z-10">
                <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm mb-6">Step 1</span>

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Verify your LGA & Get OTP</h2>

                <p className="text-white/90 text-lg mb-8">
                  Select your state and LGA, provide your phone number to receive a secure OTP for authentication and
                  access to the security assessment.
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                >
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=300&fit=crop"
                    alt="Phone verification"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle className="h-5 w-5 text-[#34D399]" />
                    <span>Secure OTP Verification</span>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
            </motion.div>

            {/* Step 2 */}
            <motion.div
              ref={step2Ref}
              whileHover={{ y: -10 }}
              className="relative rounded-3xl bg-gradient-to-br from-yellow-400 to-yellow-500 p-8 md:p-12 overflow-hidden"
            >
              <div className="relative z-10">
                <span className="inline-block px-4 py-1 rounded-full bg-black/10 text-black text-sm mb-6">Step 2</span>

                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Complete the security assessment</h2>

                <p className="text-black/80 text-lg mb-8">
                  Answer questions across 6 security dimensions. Each section provides context through quotations before
                  you begin the assessment.
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/30 backdrop-blur-md rounded-2xl p-6 border border-white/40"
                >
                  <img
                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop"
                    alt="Assessment survey"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-black">
                      <CheckCircle className="h-5 w-5 text-[#34D399]" />
                      <span className="font-medium">6 Security Dimensions</span>
                    </div>
                    <div className="flex items-center gap-3 text-black">
                      <CheckCircle className="h-5 w-5 text-[#34D399]" />
                      <span className="font-medium">60 Comprehensive Questions</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/30 rounded-full blur-2xl" />
            </motion.div>
          </div>

          {/* Step 3 */}
          <motion.div
            ref={step3Ref}
            whileHover={{ y: -10 }}
            className="relative rounded-3xl bg-gradient-to-br from-[#34D399] to-emerald-500 p-8 md:p-12 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-black/10 text-black text-sm mb-6">Step 3</span>

                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">View Results & AI Analysis</h2>

                <p className="text-black/80 text-lg mb-8">
                  Get instant LSAr (Local Security Assessment Rating) scores, comprehensive AI-generated analysis,
                  neighboring LGA comparisons, and downloadable PDF reports.
                </p>

                <Link href="/lga-login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-full bg-black text-white font-medium flex items-center gap-2 hover:bg-black/90 transition-colors"
                  >
                    Get Started for free
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30"
                >
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop"
                    alt="Analytics dashboard"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-black font-medium text-sm">Detailed Analytics</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-purple-500/20 backdrop-blur-md rounded-2xl p-4 border border-purple-400/30 mt-8"
                >
                  <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=300&fit=crop"
                    alt="AI analysis"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-black font-medium text-sm">AI-Generated Insights</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-blue-500/20 backdrop-blur-md rounded-2xl p-4 border border-blue-400/30 col-span-2"
                >
                  <img
                    src="https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=400&h=200&fit=crop"
                    alt="Map comparison"
                    className="w-full h-24 object-cover rounded-lg mb-3"
                  />
                  <p className="text-black font-medium text-sm">LGA Comparisons & Maps</p>
                </motion.div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Ready to assess your LGA's security?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join other LGAs in creating a comprehensive security awareness map of Nigeria
          </p>
          <Link href="/lga-login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-full bg-[#34D399] text-black font-semibold text-lg hover:bg-[#34D399]/90 transition-colors"
            >
              Start Assessment Now
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
