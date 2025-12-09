import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OverallLSArCardProps {
  overallLSAr: number
  selectedLga: string
  getLSArColor: (score: number) => string
  getLSArRating: (score: number) => string
}

export function OverallLSArCard({ overallLSAr, selectedLga, getLSArColor, getLSArRating }: OverallLSArCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall LSAr Rating</CardTitle>
        <CardDescription>Local Security Assessment Rating for {selectedLga}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: getLSArColor(overallLSAr) }}
          >
            {overallLSAr}%
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: getLSArColor(overallLSAr) }}>
              {getLSArRating(overallLSAr)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Overall security preparedness rating
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
