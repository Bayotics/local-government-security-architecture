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
        "Local Security Decision Making Authority": 0,
        "Development of Local Security Instruments": 0,
        "Local Security Intelligence and Early Warning": 0,
        "Dedicated Resources for Local Security Provision": 0,
        "Local Security Intervention Institutions and Mechanisms": 0,
        "Local Security Performance Measurement and Evaluation": 0,
      }

      results.forEach((result: any) => {
        if (result.sectionScores) {
          Object.keys(sectionTotals).forEach((sectionName) => {
            sectionTotals[sectionName as keyof typeof sectionTotals] += result.sectionScores[sectionName] || 0
          })
        }
      })

      // Calculate averages
      const averageScores: Record<string, number> = {}
      Object.keys(sectionTotals).forEach((sectionName) => {
        averageScores[sectionName] = count > 0 ? sectionTotals[sectionName as keyof typeof sectionTotals] / count : 0
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
    return NextResponse.json({ error: 'Error fetching Scores. Check your network' }, { status: 500 })
  }
}
