export const getLSArColor = (score: number): string => {
  if (score >= 80) return "#8b5cf6" // Purple - Excellent
  if (score >= 60) return "#f37209" // Orange - Good
  if (score >= 40) return "#2323dd" // blue - Satisfactory
  if (score >= 20) return "#f3f728" // Yellow - poor
  return "#ff0000" // red - Very poor
}

export const getLSArRating = (score: number): string => {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Satisfactory"
  if (score >= 20) return "Poor"
  return "Very Poor"
}

export interface NeighboringLGAData {
  lga: string
  score: number
  color: string
}
