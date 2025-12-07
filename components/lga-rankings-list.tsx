"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Award, Medal } from "lucide-react"
import { motion } from "framer-motion"

interface LGAScore {
  state: string
  lga: string
  lsarScore: number
  colorCoding: {
    color: string
    label: string
  }
}

interface LGARankingsListProps {
  lgaScores: LGAScore[]
}

export default function LGARankingsList({ lgaScores }: LGARankingsListProps) {
  // Sort LGAs by score from highest to lowest
  const rankedLGAs = [...lgaScores].sort((a, b) => b.lsarScore - a.lsarScore)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Award className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />
    return null
  }

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className="flex items-center gap-2">
          {getRankIcon(rank)}
          <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">#{rank}</span>
        </div>
      )
    }
    return <span className="text-xl font-semibold text-slate-600 dark:text-slate-400">#{rank}</span>
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {rankedLGAs.map((lga, index) => (
        <motion.div
          key={`${lga.state}-${lga.lga}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <Card
            className="hover:shadow-lg transition-all duration-300 border-l-4 hover:scale-[1.02]"
            style={{ borderLeftColor: lga.colorCoding.color }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-20">{getRankBadge(index + 1)}</div>

                {/* LGA Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{lga.lga}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{lga.state} State</p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: lga.colorCoding.color }}>
                    {lga.lsarScore.toFixed(1)}%
                  </div>
                  <Badge
                    className="mt-1"
                    style={{
                      backgroundColor: lga.colorCoding.color,
                      color: "#fff",
                    }}
                  >
                    {lga.colorCoding.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {rankedLGAs.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No LGA data available yet. Complete surveys to see rankings.
        </div>
      )}
    </div>
  )
}
