import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { SurveyResult } from "@/lib/models"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { state, lga, sectionScores, answers } = body

    if (!state || !lga || !sectionScores || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("security_survey")

    const surveyResult: SurveyResult = {
      state,
      lga,
      date: new Date(),
      sectionScores,
      answers,
    }

    const result = await db.collection("survey_results").insertOne(surveyResult)

    return NextResponse.json({
      success: true,
      id: result.insertedId,
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

    let query = {}
    if (state) {
      query = { state }
    }

    const results = await db.collection("survey_results").find(query).sort({ date: -1 }).limit(100).toArray()

    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error fetching survey results:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
