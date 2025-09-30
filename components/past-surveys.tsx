"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Calendar, BarChart3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { SurveyResult } from "@/lib/models"

interface PastSurveysProps {
  surveys: SurveyResult[]
  selectedLga: string
}

const getLSArColor = (score: number): string => {
  if (score >= 80) return "#8b5cf6" // Purple - Excellent
  if (score >= 60) return "#f37209" // Orange - Good
  if (score >= 40) return "#2323dd" // Blue - Satisfactory
  if (score >= 20) return "#f3f728" // Yellow - Poor
  return "#ff0000" // Red - Very Poor
}

const getLSArRating = (score: number): string => {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Satisfactory"
  if (score >= 20) return "Poor"
  return "Very Poor"
}

export function PastSurveys({ surveys, selectedLga }: PastSurveysProps) {
  const [showAll, setShowAll] = useState(false)

  if (!surveys || surveys.length === 0) {
    return null
  }

  // Sort surveys by date (most recent first)
  const sortedSurveys = [...surveys].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Show only the most recent survey initially
  const displayedSurveys = showAll ? sortedSurveys : [sortedSurveys[0]]
  const hiddenCount = sortedSurveys.length - 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Past Surveys
          </CardTitle>
          <CardDescription>
            {surveys.length} {surveys.length === 1 ? "survey" : "surveys"} previously conducted in {selectedLga}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedSurveys.map((survey, index) => (
              <motion.div
                key={survey._id || index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: getLSArColor(survey.lsarScore) }}
                        >
                          {survey.lsarScore}%
                        </div>
                        <div>
                          <div className="font-semibold text-lg" style={{ color: getLSArColor(survey.lsarScore) }}>
                            {getLSArRating(survey.lsarScore)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(survey.date).toLocaleDateString("en-NG", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      {index === 0 && hiddenCount > 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Most Recent</span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Section Scores</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(survey.sectionScores).map(([section, score]) => (
                          <div key={section} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium truncate pr-2">{section}</span>
                              <span className="font-semibold">{score}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-primary h-1.5 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {hiddenCount > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowAll(!showAll)}>
                {showAll ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    See All Past Surveys ({hiddenCount} more)
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
