import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("security_survey")

    const url = new URL(req.url)
    const state = url.searchParams.get("state")

    // Build query based on parameters
    let query = {}
    if (state) {
      query = { state }
    }

    // Aggregate scores by local government
    const lgaScores = await db
      .collection("survey_results")
      .aggregate([
        {
          $match: query,
        },
        {
          $group: {
            _id: {
              state: "$state",
              lga: "$lga",
            },
            authorityScores: { $push: "$sectionScores.Authority & Governance" },
            resourcesScores: { $push: "$sectionScores.Resources & Personnel" },
            fundingScores: { $push: "$sectionScores.Funding & Budget Allocation" },
            infrastructureScores: { $push: "$sectionScores.Infrastructure & Facilities" },
            communityScores: { $push: "$sectionScores.Community Engagement" },
            technologyScores: { $push: "$sectionScores.Technology & Intelligence" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            state: "$_id.state",
            lga: "$_id.lga",
            _id: 0,
            count: 1,
            averageScores: {
              "Authority & Governance": { $avg: "$authorityScores" },
              "Resources & Personnel": { $avg: "$resourcesScores" },
              "Funding & Budget Allocation": { $avg: "$fundingScores" },
              "Infrastructure & Facilities": { $avg: "$infrastructureScores" },
              "Community Engagement": { $avg: "$communityScores" },
              "Technology & Intelligence": { $avg: "$technologyScores" },
            },
          },
        },
        {
          $sort: { state: 1, lga: 1 },
        },
      ])
      .toArray()

    return NextResponse.json(lgaScores)
  } catch (error: any) {
    console.error("Error fetching LGA scores:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
