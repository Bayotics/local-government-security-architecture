import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { LGAWhitelist } from "@/lib/models"

export async function POST(request: Request) {
  try {
    const { stateId, lgaId } = await request.json()

    if (!stateId || !lgaId) {
      return NextResponse.json(
        { error: "State and LGA are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    
    const uniqueLgaId = `${stateId}-${lgaId}`
    
    const lgaRecord = await db
      .collection<LGAWhitelist>("lgaWhitelist")
      .findOne({ lgaId: uniqueLgaId, status: "active" })

    if (!lgaRecord) {
      return NextResponse.json(
        { error: "LGA not found or inactive" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      lgaName: lgaRecord.lgaName,
      stateName: lgaRecord.stateName,
      phone: lgaRecord.officialPhone,
    })
  } catch (error) {
    console.error("[v0] Check LGA error:", error)
    return NextResponse.json(
      { error: "Failed to verify LGA" },
      { status: 500 }
    )
  }
}
