"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import type { Question } from "@/lib/survey-data"

interface QuestionOptionsProps {
  question: Question
  selectedOptionId?: string
  onChange: (optionId: string) => void
}

export function QuestionOptions({ question, selectedOptionId, onChange }: QuestionOptionsProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)

  const groupedOptions = question.options.reduce(
    (groups, option) => {
      const score = option.score
      if (!groups[score]) {
        groups[score] = []
      }
      groups[score].push(option)
      return groups
    },
    {} as Record<number, typeof question.options>,
  )

  // Sort score groups in descending order (1, 0, -1)
  const sortedScoreGroups = Object.keys(groupedOptions)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div
        className="grid gap-6 max-w-6xl mx-auto"
        style={{ gridTemplateColumns: `repeat(${sortedScoreGroups.length}, 1fr)` }}
      >
        <AnimatePresence>
          {sortedScoreGroups.map((score, groupIndex) => (
            <motion.div
              key={score}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: groupIndex * 0.1 }}
              className="space-y-3"
            >
              {/* Score group header */}
              {/* <div className="text-center">
                <span
                  className={`inline-block text-sm px-4 py-2 rounded-full font-semibold ${
                    score === 1
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : score === 0
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {score > 0 ? `+${score}` : score} points
                </span>
              </div> */}

              <div className="space-y-3">
                {groupedOptions[score].map((option, optionIndex) => {
                  const isSelected = selectedOptionId === option.id
                  const isHovered = hoveredOption === option.id

                  return (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: groupIndex * 0.1 + optionIndex * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all duration-200 border-2 min-h-[80px] flex items-center ${
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
                          <span className="text-sm font-medium leading-relaxed flex-1 pr-3 text-center">
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
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
