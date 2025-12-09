import type { SurveyResult } from "./models"

export interface SectionComparison {
  sectionName: string
  previousScore: number
  currentScore: number
  change: number
  percentageChange: number
  status: "improved" | "declined" | "unchanged"
  remark: string
}

export interface OverallComparison {
  previousLSAr: number
  currentLSAr: number
  change: number
  percentageChange: number
  status: "improved" | "declined" | "unchanged"
  remark: string
  sectionComparisons: SectionComparison[]
}

export function generateSectionRemark(comparison: SectionComparison): string {
  const { sectionName, change, percentageChange, status } = comparison

  if (status === "unchanged") {
    return `${sectionName} maintained the same performance level with no significant change.`
  }

  const direction = status === "improved" ? "improved" : "declined"
  const changeDesc = Math.abs(percentageChange).toFixed(1)

  if (Math.abs(change) < 5) {
    return `${sectionName} showed a slight ${direction} of ${changeDesc}% compared to the previous survey.`
  } else if (Math.abs(change) < 15) {
    return `${sectionName} demonstrated a moderate ${direction} of ${changeDesc}%, indicating ${
      status === "improved" ? "positive progress" : "areas needing attention"
    }.`
  } else {
    return `${sectionName} experienced a significant ${direction} of ${changeDesc}%, representing ${
      status === "improved" ? "substantial improvement" : "considerable decline"
    } in this area.`
  }
}

export function generateOverallRemark(comparison: OverallComparison): string {
  const { change, percentageChange, status, sectionComparisons } = comparison

  if (status === "unchanged") {
    return "The overall security assessment rating remained stable with no significant change from the previous survey."
  }

  const direction = status === "improved" ? "improvement" : "decline"
  const changeDesc = Math.abs(percentageChange).toFixed(1)

  const improvedSections = sectionComparisons.filter((s) => s.status === "improved").length
  const declinedSections = sectionComparisons.filter((s) => s.status === "declined").length

  let contextualInfo = ""
  if (status === "improved") {
    contextualInfo = `This positive trend is reflected across ${improvedSections} section${
      improvedSections !== 1 ? "s" : ""
    }, indicating strengthened security capabilities.`
  } else {
    contextualInfo = `This decline is observed in ${declinedSections} section${
      declinedSections !== 1 ? "s" : ""
    }, highlighting areas requiring immediate attention and intervention.`
  }

  if (Math.abs(change) < 5) {
    return `The overall security assessment showed a slight ${direction} of ${changeDesc}%. ${contextualInfo}`
  } else if (Math.abs(change) < 15) {
    return `The overall security assessment demonstrated a moderate ${direction} of ${changeDesc}%. ${contextualInfo}`
  } else {
    return `The overall security assessment experienced a significant ${direction} of ${changeDesc}%. ${contextualInfo}`
  }
}

export function compareSurveys(previousSurvey: SurveyResult, currentSurvey: SurveyResult): OverallComparison {
  const sectionComparisons: SectionComparison[] = []

  // Compare each section
  Object.keys(currentSurvey.sectionScores).forEach((sectionName) => {
    const currentScore = currentSurvey.sectionScores[sectionName]
    const previousScore = previousSurvey.sectionScores[sectionName] || 0

    const change = currentScore - previousScore
    const percentageChange = previousScore > 0 ? (change / previousScore) * 100 : 0

    let status: "improved" | "declined" | "unchanged"
    if (Math.abs(change) < 2) {
      status = "unchanged"
    } else if (change > 0) {
      status = "improved"
    } else {
      status = "declined"
    }

    const comparison: SectionComparison = {
      sectionName,
      previousScore,
      currentScore,
      change,
      percentageChange,
      status,
      remark: "",
    }

    comparison.remark = generateSectionRemark(comparison)
    sectionComparisons.push(comparison)
  })

  // Calculate overall comparison
  const previousLSAr = previousSurvey.lsarScore
  const currentLSAr = currentSurvey.lsarScore
  const overallChange = currentLSAr - previousLSAr
  const overallPercentageChange = previousLSAr > 0 ? (overallChange / previousLSAr) * 100 : 0

  let overallStatus: "improved" | "declined" | "unchanged"
  if (Math.abs(overallChange) < 2) {
    overallStatus = "unchanged"
  } else if (overallChange > 0) {
    overallStatus = "improved"
  } else {
    overallStatus = "declined"
  }

  const overallComparison: OverallComparison = {
    previousLSAr,
    currentLSAr,
    change: overallChange,
    percentageChange: overallPercentageChange,
    status: overallStatus,
    remark: "",
    sectionComparisons,
  }

  overallComparison.remark = generateOverallRemark(overallComparison)

  return overallComparison
}
