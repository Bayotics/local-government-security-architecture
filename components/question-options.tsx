"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Info } from 'lucide-react'
import type { Question } from "@/lib/survey-data"

interface QuestionOptionsProps {
  question: Question
  selectedOptionId?: string
  selectedOptionIds?: string[]
  onChange: (optionId: string) => void
}

export function QuestionOptions({ question, selectedOptionId, selectedOptionIds, onChange }: QuestionOptionsProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  const optionCount = question.options.length
  let gridClass = ""
  
  if (optionCount === 4) {
    // 2 columns × 2 rows
    gridClass = "grid-cols-2 gap-3"
  } else if (optionCount === 5) {
    // 3 columns with middle column having 3 rows: layout as 2-1, 1-1-1
    gridClass = "grid-cols-3 gap-3"
  } else if (optionCount === 6) {
    // 3 columns × 2 rows
    gridClass = "grid-cols-3 gap-3"
  } else if (optionCount === 3) {
    // 3 columns × 1 row
    gridClass = "grid-cols-3 gap-3"
  } else {
    // Default: dynamic columns based on count
    gridClass = `grid-cols-${Math.min(optionCount, 3)} gap-3`
  }

  const isMultiSelect = question.allowMultiple === true
  const currentSelections = isMultiSelect ? (selectedOptionIds || []) : (selectedOptionId ? [selectedOptionId] : [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Multi-select indicator and tooltip */}
      {isMultiSelect && (
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
            <span>Multiple Choice</span>
          </span>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              title=""
            >
              <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute left-0 top-full mt-1 z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap"
                >
                  Select all the most applicable options. "Unsure" cannot be combined with other choices.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className={`grid ${gridClass} w-full`}>
        <AnimatePresence>
          {question.options.map((option, index) => {
            const isSelected = currentSelections.includes(option.id)
            const isHovered = hoveredOption === option.id

            let gridPosition = ""
            if (optionCount === 5) {
              // First two options in first row (columns 1-2)
              // Third option alone in second row, column 2 (middle)
              // Last two options in third row (columns 1-2)
              if (index === 0) gridPosition = "col-start-1 row-start-1"
              else if (index === 1) gridPosition = "col-start-2 row-start-1"
              else if (index === 2) gridPosition = "col-start-2 row-start-2"
              else if (index === 3) gridPosition = "col-start-1 row-start-3"
              else if (index === 4) gridPosition = "col-start-2 row-start-3"
            }

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={gridPosition}
              >
                <Card
                  className={`p-3 cursor-pointer transition-all duration-200 border-2 min-h-[60px] flex items-center ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md"
                      : isHovered
                        ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => onChange(option.id)}
                  onMouseEnter={() => setHoveredOption(option.id)}
                  onMouseLeave={() => setHoveredOption(null)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1 pr-2 text-center">
                      {option.text}
                    </span>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          {isMultiSelect ? (
                            <div className="w-4 h-4 bg-blue-500 rounded border border-blue-600 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            </div>
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
