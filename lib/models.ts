export interface SurveyResult {
    _id?: string
    state: string
    lga: string
    date: Date
    sectionScores: {
      [key: string]: number
    }
    answers: {
      [key: string]: number
    }
  }
  