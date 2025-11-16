import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SectionScoresCardProps {
  sectionScores: Record<string, number>
}

export function SectionScoresCard({ sectionScores }: SectionScoresCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Scores</CardTitle>
        <CardDescription>Average scores for each section of the survey (0-100% scale)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(sectionScores).map(([section, score]) => (
            <div key={section}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{section}</span>
                <span className="font-medium">{score}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${score}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
