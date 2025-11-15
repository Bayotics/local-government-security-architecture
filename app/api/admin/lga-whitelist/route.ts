import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { LGAWhitelist } from "@/lib/models"

// GET - List all LGAs with search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const state = searchParams.get("state") || ""
    const status = searchParams.get("status") || ""

    const client = await clientPromise
    const db = client.db()

    const query: any = {}
    
    if (search) {
      query.$or = [
        { lgaName: { $regex: search, $options: "i" } },
        { chairmanName: { $regex: search, $options: "i" } },
      ]
    }
    
    if (state) {
      query.stateName = state
    }
    
    if (status) {
      query.status = status
    }

    const lgas = await db
      .collection<LGAWhitelist>("lgaWhitelist")
      .find(query)
      .sort({ stateName: 1, lgaName: 1 })
      .toArray()

    return NextResponse.json({ lgas })
  } catch (error) {
    console.error("[v0] Get LGA whitelist error:", error)
    return NextResponse.json(
      { error: "Failed to fetch LGA whitelist" },
      { status: 500 }
    )
  }
}

// POST - Create/Update LGA
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const client = await clientPromise
    const db = client.db()

    const lgaData: LGAWhitelist = {
      ...data,
      updatedAt: new Date(),
      createdAt: data._id ? undefined : new Date(),
    }

    if (data._id) {
      // Update existing
      await db
        .collection<LGAWhitelist>("lgaWhitelist")
        .updateOne({ _id: data._id }, { $set: lgaData })
    } else {
      // Create new
      await db.collection<LGAWhitelist>("lgaWhitelist").insertOne(lgaData)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update LGA whitelist error:", error)
    return NextResponse.json(
      { error: "Failed to update LGA whitelist" },
      { status: 500 }
    )
  }
}
