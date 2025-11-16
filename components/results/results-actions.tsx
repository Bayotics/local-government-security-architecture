import { Button } from "@/components/ui/button"
import { Download, Loader2 } from 'lucide-react'

interface ResultsActionsProps {
  loading: boolean
  error: string | null
  analysis: string
  downloadingPdf: boolean
  onBackToSurvey: () => void
  onStartNewSurvey: () => void
  onDownloadReport: () => void
}

export function ResultsActions({
  loading,
  error,
  analysis,
  downloadingPdf,
  onBackToSurvey,
  onStartNewSurvey,
  onDownloadReport
}: ResultsActionsProps) {
  return (
    <div className="mt-6 flex justify-between">
      <Button variant="outline" onClick={onBackToSurvey}>
        Back to Survey
      </Button>
      <div className="space-x-2">
        <Button variant="outline" onClick={onStartNewSurvey}>
          Start New Survey
        </Button>
        <Button onClick={onDownloadReport} disabled={loading || !!error || !analysis || downloadingPdf}>
          {downloadingPdf ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
