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

export interface LGAWhitelist {
  _id?: string
  lgaId: string // Unique identifier for LGA (e.g., "25-510" for state 25, lga 510)
  lgaName: string
  stateName: string
  stateId: number
  chairmanName: string
  officialPhone: string
  representativePhone?: string
  status: "active" | "inactive" | "replaced"
  boundDeviceId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface OTPSession {
  _id?: string
  lgaId: string
  phone: string
  otp: string
  expiresAt: Date
  createdAt: Date
  attempts: number
}

export interface UserSession {
  _id?: string
  lgaId: string
  deviceId: string
  ipAddress: string
  userAgent: string
  createdAt: Date
  lastActivity: Date
  isActive: boolean
}

export interface AdminUser {
  _id?: string
  username: string
  passwordHash: string
  role: "super_admin" | "admin"
  createdAt: Date
  lastLogin?: Date
}
