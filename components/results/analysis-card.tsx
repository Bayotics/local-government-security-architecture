import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, RefreshCcw } from 'lucide-react'

interface AnalysisCardProps {
  loading: boolean
  error: string | null
  analysis: string
  onRetry: () => void
}

export function AnalysisCard({ loading, error, analysis, onRetry }: AnalysisCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Analysis</CardTitle>
        <CardDescription>Analysis based on your survey responses</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Generating your security analysis...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Button onClick={onRetry} className="mt-4">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            {analysis ? (
              analysis.split("\n").map((line, index) => {
                if (line.startsWith("# ")) {
                  return (
                    <h1 key={index} className="text-2xl font-bold mt-6 mb-4">
                      {line.replace("# ", "")}
                    </h1>
                  )
                } else if (line.startsWith("## ")) {
                  return (
                    <h2 key={index} className="text-xl font-bold mt-5 mb-3">
                      {line.replace("## ", "")}
                    </h2>
                  )
                } else if (line.startsWith("### ")) {
                  return (
                    <h3 key={index} className="text-lg font-bold mt-4 mb-2">
                      {line.replace("### ", "")}
                    </h3>
                  )
                } else if (line.startsWith("- ")) {
                  return (
                    <li key={index} className="ml-4">
                      {line.replace("- ", "")}
                    </li>
                  )
                } else if (line.trim() === "") {
                  return <br key={index} />
                } else {
                  return (
                    <p key={index} className="my-2">
                      {line}
                    </p>
                  )
                }
              })
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400">
                No analysis generated. Please try again.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
