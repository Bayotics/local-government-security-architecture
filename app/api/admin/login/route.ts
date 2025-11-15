import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { AdminUser } from "@/lib/models"
import { cookies } from "next/headers"
import bcrypt from 'bcryptjs'

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

function generateSessionToken(): string {
  return `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    console.log("[v0] Admin login attempt for username:", username)

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    const admin = await db.collection<AdminUser>("adminUsers").findOne({ username })

    console.log("[v0] Admin user found:", admin ? "Yes" : "No")
    if (admin) {
      console.log("[v0] Admin details - username:", admin.username, "role:", admin.role)
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const isPasswordValid = await verifyPassword(password, admin.passwordHash)
    console.log("[v0] Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.collection("admin_sessions").insertOne({
      token: sessionToken,
      adminId: admin._id,
      createdAt: new Date(),
      expiresAt,
    })

    // Update last login
    await db.collection<AdminUser>("adminUsers").updateOne(
      { _id: admin._id },
      { $set: { lastLogin: new Date() } }
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })

    console.log("[v0] Admin login successful")

    return NextResponse.json({
      success: true,
      username: admin.username,
      role: admin.role,
    })
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
