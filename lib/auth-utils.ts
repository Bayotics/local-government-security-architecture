import { cookies } from "next/headers"
import clientPromise from "@/lib/mongodb"
import type { AdminUser } from "@/lib/models"

export async function verifyAdminSession(): Promise<{ isAdmin: boolean; username?: string }> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin_session")?.value

    if (!sessionToken) {
      return { isAdmin: false }
    }

    const client = await clientPromise
    const db = client.db()

    // Verify session exists and is valid
    const session = await db.collection("admin_sessions").findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() },
    })

    if (!session) {
      return { isAdmin: false }
    }

    const admin = await db.collection<AdminUser>("adminUsers").findOne({
      _id: session.adminId,
    })

    if (!admin) {
      return { isAdmin: false }
    }

    return { isAdmin: true, username: admin.username }
  } catch (error) {
    console.error("[v0] Verify admin session error:", error)
    return { isAdmin: false }
  }
}
