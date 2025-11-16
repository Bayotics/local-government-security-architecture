import { useState, useEffect } from "react"
import { getLSArRating, type NeighboringLGAData } from "@/lib/results-utils"

export function useNeighboringAdvisory(
  neighboringLGAs: NeighboringLGAData[],
  overallLSAr: number,
  selectedLga: string
) {
  const [neighboringAdvisory, setNeighboringAdvisory] = useState<string>("")
  const [loadingAdvisory, setLoadingAdvisory] = useState(false)

  useEffect(() => {
    const generateNeighboringAdvisory = async () => {
      const lgasWithData = neighboringLGAs.filter((lga) => lga.score > 0)
      
      if (lgasWithData.length === 0) {
        setNeighboringAdvisory("")
        return
      }

      try {
        setLoadingAdvisory(true)
        
        const lgaPerformanceData = lgasWithData.map((lga) => ({
          name: lga.lga,
          score: lga.score,
          rating: getLSArRating(lga.score)
        }))

        const currentLgaData = {
          name: selectedLga,
          score: overallLSAr,
          rating: getLSArRating(overallLSAr)
        }

        const response = await fetch("/api/generate-neighboring-advisory", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentLga: currentLgaData,
            neighboringLGAs: lgaPerformanceData,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate advisory")
        }

        const data = await response.json()
        setNeighboringAdvisory(data.advisory)
      } catch (error) {
        console.error("Error generating neighboring advisory:", error)
        setNeighboringAdvisory("")
      } finally {
        setLoadingAdvisory(false)
      }
    }

    if (neighboringLGAs.length > 0 && overallLSAr > 0 && selectedLga) {
      generateNeighboringAdvisory()
    }
  }, [neighboringLGAs, overallLSAr, selectedLga])

  return { neighboringAdvisory, loadingAdvisory }
}
