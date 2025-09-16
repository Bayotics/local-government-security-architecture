import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { calculateLSAr, getColorCoding } from "@/lib/survey-data"

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("security_survey")

    const stateScores = await db
      .collection("survey_results")
      .aggregate([
        {
          $group: {
            _id: "$state",
            results: { $push: "$$ROOT" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            state: "$_id",
            _id: 0,
            count: 1,
            results: 1,
          },
        },
        {
          $sort: { state: 1 },
        },
      ])
      .toArray()

    // Process results to calculate LSAr scores and color coding
    const processedScores = stateScores.map((stateData: any) => {
      const { state, count, results } = stateData

      // Calculate average section scores across all LGAs in the state
      const sectionTotals = {
        "decision-making": 0,
        instruments: 0,
        intelligence: 0,
        resources: 0,
        institutions: 0,
        evaluation: 0,
      }

      results.forEach((result: any) => {
        if (result.sectionScores) {
          Object.keys(sectionTotals).forEach((sectionId) => {
            sectionTotals[sectionId as keyof typeof sectionTotals] += result.sectionScores[sectionId] || 0
          })
        }
      })

      // Calculate averages
      const averageScores: Record<string, number> = {}
      Object.keys(sectionTotals).forEach((sectionId) => {
        averageScores[sectionId] = count > 0 ? sectionTotals[sectionId as keyof typeof sectionTotals] / count : 0
      })

      // Calculate overall LSAr score
      const lsarScore = calculateLSAr(averageScores)
      const colorCoding = getColorCoding(lsarScore)

      return {
        state,
        count,
        averageScores,
        lsarScore,
        colorCoding,
      }
    })

    return NextResponse.json(processedScores)
  } catch (error: any) {
    console.error("Error fetching state scores:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
