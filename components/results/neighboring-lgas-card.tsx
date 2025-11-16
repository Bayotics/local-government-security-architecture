import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Loader2 } from 'lucide-react'

interface NeighboringLGAData {
  lga: string
  score: number
  color: string
}

interface NeighboringLGAsCardProps {
  neighboringLGAs: NeighboringLGAData[]
  neighboringAdvisory: string
  loadingAdvisory: boolean
}

export function NeighboringLGAsCard({ neighboringLGAs, neighboringAdvisory, loadingAdvisory }: NeighboringLGAsCardProps) {
  if (neighboringLGAs.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Neighboring LGAs Comparison</CardTitle>
        <CardDescription>LSAr scores of surrounding local governments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={neighboringLGAs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lga" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" name="LSAr Score (%)">
                {neighboringLGAs.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {neighboringLGAs.filter((lga) => lga.score > 0).length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
              Regional Security Advisory
            </h4>
            {loadingAdvisory ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing neighboring LGAs performance...</span>
              </div>
            ) : neighboringAdvisory ? (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {neighboringAdvisory}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
