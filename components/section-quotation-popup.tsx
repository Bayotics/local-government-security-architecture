"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Quote, Sparkles } from "lucide-react"
import { getQuotationBySection } from "@/lib/sections-quotation"

interface SectionQuotationPopupProps {
  isOpen: boolean
  sectionTitle: string
  sectionId: string
  onContinue: () => void
}

export function SectionQuotationPopup({ isOpen, sectionTitle, sectionId, onContinue }: SectionQuotationPopupProps) {
  const quotationData = getQuotationBySection(sectionId)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onContinue}
          />

          {/* Popup Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative max-w-2xl w-full my-8"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl blur-xl opacity-30 animate-pulse" />

              {/* Card */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-emerald-500/20 overflow-hidden max-h-[80vh] overflow-y-auto">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                {/* Content */}
                <div className="relative p-8 md:p-12">
                  {/* Section Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-2 mb-6"
                  >
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">
                      Section Overview
                    </span>
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </motion.div>

                  {/* Section Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-3xl font-bold text-center mb-8 text-white text-balance"
                  >
                    {sectionTitle}
                  </motion.h2>

                  {/* Quote Icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="flex justify-center mb-6"
                  >
                    <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      <Quote className="w-8 h-8 text-emerald-400" />
                    </div>
                  </motion.div>

                  {quotationData?.author && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm md:text-base text-emerald-400 text-center font-semibold mb-3"
                    >
                      {quotationData.author}
                    </motion.p>
                  )}

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="text-base md:text-lg text-emerald-300 text-center leading-relaxed mb-6 text-pretty px-4 italic"
                  >
                    {quotationData?.quotation}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm md:text-base text-slate-300 text-center leading-relaxed mb-10 text-pretty px-4"
                  >
                    {quotationData?.subQuotation}
                  </motion.p>

                  {/* Continue Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={onContinue}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                    >
                      Continue to Questions
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
