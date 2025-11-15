import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { LGAWhitelist, OTPSession, UserSession } from "@/lib/models"
import { generateDeviceFingerprint, getClientIP } from "@/lib/device-utils"

const MAX_OTP_ATTEMPTS = 3

export async function POST(request: Request) {
  try {
    const { stateId, lgaId, otp } = await request.json()

    console.log("[v0] Verify OTP called with:", { stateId, lgaId, otp })

    if (!stateId || !lgaId || !otp) {
      return NextResponse.json(
        { error: "State, LGA, and OTP are required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()
    
    const uniqueLgaId = `${stateId}-${lgaId}`
    
    console.log("[v0] Looking for OTP session with lgaId:", uniqueLgaId)

    // Find the OTP session
    const otpSession = await db
      .collection<OTPSession>("otp_sessions")
      .findOne({ 
        lgaId: uniqueLgaId,
        expiresAt: { $gt: new Date() }
      })

    console.log("[v0] Found OTP session:", otpSession)

    if (!otpSession) {
      return NextResponse.json(
        { error: "OTP expired or not found" },
        { status: 400 }
      )
    }

    // Check attempts
    if (otpSession.attempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new OTP" },
        { status: 429 }
      )
    }

    // Verify OTP
    console.log("[v0] Comparing OTPs - Stored:", otpSession.otp, "Provided:", otp)
    
    if (otpSession.otp !== otp) {
      // Increment attempts
      await db
        .collection<OTPSession>("otp_sessions")
        .updateOne(
          { _id: otpSession._id },
          { $inc: { attempts: 1 } }
        )

      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    console.log("[v0] OTP verified successfully!")

    // OTP is valid - check device binding
    const lgaRecord = await db
      .collection<LGAWhitelist>("lgaWhitelist")
      .findOne({ lgaId: uniqueLgaId, status: "active" })

    if (!lgaRecord) {
      return NextResponse.json(
        { error: "LGA not found or inactive" },
        { status: 404 }
      )
    }

    const deviceId = generateDeviceFingerprint(request)
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get("user-agent") || ""

    // Check device binding
    if (lgaRecord.boundDeviceId) {
      // Device already bound - check if it matches
      if (lgaRecord.boundDeviceId !== deviceId) {
        return NextResponse.json(
          { 
            error: "device_mismatch",
            message: "New device detected. This device is not authorized. Please request admin approval or sign in again.",
            requiresApproval: true
          },
          { status: 403 }
        )
      }
    } else {
      // First login - bind device
      await db
        .collection<LGAWhitelist>("lgaWhitelist")
        .updateOne(
          { lgaId: uniqueLgaId },
          { 
            $set: { 
              boundDeviceId: deviceId,
              updatedAt: new Date()
            } 
          }
        )
    }

    // Create user session
    const session: UserSession = {
      lgaId: uniqueLgaId,
      deviceId,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
    }

    const sessionResult = await db.collection<UserSession>("user_sessions").insertOne(session)

    // Delete OTP session
    await db
      .collection<OTPSession>("otp_sessions")
      .deleteOne({ _id: otpSession._id })

    return NextResponse.json({
      success: true,
      sessionId: sessionResult.insertedId.toString(),
      lgaName: lgaRecord.lgaName,
      stateName: lgaRecord.stateName,
      stateId: lgaRecord.stateId,
      lgaId: lgaId,
      isFirstLogin: !lgaRecord.boundDeviceId,
    })
  } catch (error) {
    console.error("[v0] Verify OTP error:", error)
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}
