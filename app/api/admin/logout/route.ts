import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (sessionToken) {
      const client = await clientPromise
      const db = client.db()
      
      // Delete session from database
      await db.collection("admin_sessions").deleteOne({ token: sessionToken })
    }

    // Clear cookie
    cookieStore.delete("admin_session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Admin logout error:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}
