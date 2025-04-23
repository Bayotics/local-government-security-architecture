import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("security_survey")

    // Aggregate scores by state
    const stateScores = await db
      .collection("survey_results")
      .aggregate([
        {
          $group: {
            _id: "$state",
            averageScores: {
              $push: "$sectionScores",
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            state: "$_id",
            _id: 0,
            count: 1,
            averageScores: {
              $reduce: {
                input: "$averageScores",
                initialValue: {},
                in: {
                  "Authority & Governance": {
                    $avg: [
                      { $ifNull: ["$$value.Authority & Governance", 0] },
                      { $ifNull: ["$$this.Authority & Governance", 0] },
                    ],
                  },
                  "Resources & Personnel": {
                    $avg: [
                      { $ifNull: ["$$value.Resources & Personnel", 0] },
                      { $ifNull: ["$$this.Resources & Personnel", 0] },
                    ],
                  },
                  "Funding & Budget Allocation": {
                    $avg: [
                      { $ifNull: ["$$value.Funding & Budget Allocation", 0] },
                      { $ifNull: ["$$this.Funding & Budget Allocation", 0] },
                    ],
                  },
                  "Infrastructure & Facilities": {
                    $avg: [
                      { $ifNull: ["$$value.Infrastructure & Facilities", 0] },
                      { $ifNull: ["$$this.Infrastructure & Facilities", 0] },
                    ],
                  },
                  "Community Engagement": {
                    $avg: [
                      { $ifNull: ["$$value.Community Engagement", 0] },
                      { $ifNull: ["$$this.Community Engagement", 0] },
                    ],
                  },
                  "Technology & Intelligence": {
                    $avg: [
                      { $ifNull: ["$$value.Technology & Intelligence", 0] },
                      { $ifNull: ["$$this.Technology & Intelligence", 0] },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $sort: { state: 1 },
        },
      ])
      .toArray()

    return NextResponse.json(stateScores)
  } catch (error: any) {
    console.error("Error fetching state scores:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
