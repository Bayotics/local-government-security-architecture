import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { LGAWhitelist } from "@/lib/models"

export async function POST(request: Request) {
  try {
    const { lgaId } = await request.json()

    if (!lgaId) {
      return NextResponse.json(
        { error: "LGA ID is required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    await db
      .collection<LGAWhitelist>("lgaWhitelist")
      .updateOne(
        { lgaId },
        { 
          $set: { 
            boundDeviceId: null,
            updatedAt: new Date()
          } 
        }
      )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Reset device error:", error)
    return NextResponse.json(
      { error: "Failed to reset device" },
      { status: 500 }
    )
  }
}
