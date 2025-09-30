"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import type { OverallComparison } from "@/lib/comparison-utils"

interface SurveyComparisonProps {
  comparison: OverallComparison
  previousSurveyDate: Date
}

const getStatusColor = (status: "improved" | "declined" | "unchanged") => {
  switch (status) {
    case "improved":
      return "text-green-600 dark:text-green-400"
    case "declined":
      return "text-red-600 dark:text-red-400"
    case "unchanged":
      return "text-yellow-600 dark:text-yellow-400"
  }
}

const getStatusBgColor = (status: "improved" | "declined" | "unchanged") => {
  switch (status) {
    case "improved":
      return "bg-green-50 dark:bg-green-950"
    case "declined":
      return "bg-red-50 dark:bg-red-950"
    case "unchanged":
      return "bg-yellow-50 dark:bg-yellow-950"
  }
}

const getStatusIcon = (status: "improved" | "declined" | "unchanged") => {
  switch (status) {
    case "improved":
      return <TrendingUp className="h-5 w-5" />
    case "declined":
      return <TrendingDown className="h-5 w-5" />
    case "unchanged":
      return <Minus className="h-5 w-5" />
  }
}

export function SurveyComparison({ comparison, previousSurveyDate }: SurveyComparisonProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Survey Comparison
          </CardTitle>
          <CardDescription>
            Comparison with previous survey conducted on{" "}
            {new Date(previousSurveyDate).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Comparison */}
          <div className={`p-4 rounded-lg ${getStatusBgColor(comparison.status)}`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`mt-1 ${getStatusColor(comparison.status)}`}>{getStatusIcon(comparison.status)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Overall Performance</h3>
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Previous: </span>
                    <span className="font-semibold">{comparison.previousLSAr.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Current: </span>
                    <span className="font-semibold">{comparison.currentLSAr.toFixed(1)}%</span>
                  </div>
                  <div className={getStatusColor(comparison.status)}>
                    <span className="font-bold">
                      {comparison.change > 0 ? "+" : ""}
                      {comparison.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{comparison.remark}</p>
              </div>
            </div>
          </div>

          {/* Section Comparisons */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Section-by-Section Analysis</h3>
            {comparison.sectionComparisons.map((section, index) => (
              <motion.div
                key={section.sectionName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  section.status === "improved"
                    ? "border-green-200 dark:border-green-800"
                    : section.status === "declined"
                      ? "border-red-200 dark:border-red-800"
                      : "border-yellow-200 dark:border-yellow-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getStatusColor(section.status)}`}>{getStatusIcon(section.status)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{section.sectionName}</h4>
                    <div className="flex items-center gap-4 mb-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Previous: </span>
                        <span className="font-semibold">{section.previousScore.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current: </span>
                        <span className="font-semibold">{section.currentScore.toFixed(1)}%</span>
                      </div>
                      <div className={getStatusColor(section.status)}>
                        <span className="font-bold">
                          {section.change > 0 ? "+" : ""}
                          {section.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.remark}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
