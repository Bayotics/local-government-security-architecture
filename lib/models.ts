export interface SurveyResult {
  _id?: string
  state: string
  lga: string
  date: Date
  sectionScores: {
    [key: string]: number
  }
  answers: {
    [key: string]: string // Changed from number to string to store option IDs
  }
  lsarScore: number // Added overall LSAr score
  colorCoding: {
    code: string
    color: string
    label: string
  } // Added color coding information
  surveyCount?: number // The count of surveys for this LGA at the time of this survey
  previousSurveyId?: string // Reference to the previous survey in this LGA
  comparisonData?: {
    previousSurveyDate: Date
    sectionComparisons: {
      [key: string]: {
        previousScore: number
        currentScore: number
        change: number
        status: "improved" | "declined" | "unchanged"
      }
    }
    overallChange: number
    overallStatus: "improved" | "declined" | "unchanged"
    remark: string
  }
}

export interface SurveyResponse {
  questionId: string
  selectedOptionId: string
  score: number
}

export interface LGASurveyMetadata {
  _id?: string
  state: string
  lga: string
  totalSurveys: number
  lastSurveyId: string
  lastSurveyDate: Date
  lastUpdated: Date
}
