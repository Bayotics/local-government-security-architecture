import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { SurveyResult } from "@/lib/models"
import { calculateLSAr, getColorCoding } from "@/lib/survey-data"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { state, lga, sectionScores, answers } = body

    if (!state || !lga || !sectionScores || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("security_survey")

    const lsarScore = calculateLSAr(sectionScores)
    const colorCoding = getColorCoding(lsarScore)

    const previousSurveys = await db.collection("survey_results").find({ state, lga }).sort({ date: -1 }).toArray()

    const surveyCount = previousSurveys.length + 1
    const previousSurveyId = previousSurveys.length > 0 ? previousSurveys[0]._id?.toString() : undefined

    const surveyResult: SurveyResult = {
      state,
      lga,
      date: new Date(),
      sectionScores,
      answers,
      lsarScore,
      colorCoding,
      surveyCount,
      previousSurveyId,
    }

    const result = await db.collection("survey_results").insertOne(surveyResult)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
      surveyCount,
      lsarScore,
    })
  } catch (error: any) {
    console.error("Error saving survey result:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("security_survey")

    const url = new URL(req.url)
    const state = url.searchParams.get("state")
    const lga = url.searchParams.get("lga")

    const query: any = {}
    if (state) {
      query.state = state
    }
    if (lga) {
      query.lga = lga
    }

    const results = await db.collection("survey_results").find(query).sort({ date: -1 }).limit(100).toArray()

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error fetching survey results:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
