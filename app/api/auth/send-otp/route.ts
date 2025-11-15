import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { LGAWhitelist, OTPSession } from "@/lib/models"

function generateOTP(): string {
  return "123456" // Fixed OTP for testing until sender ID verification
}

async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const TERMII_API_KEY = process.env.TERMII_API_KEY
    const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "ALGON"

    if (!TERMII_API_KEY) {
      console.error("[v0] TERMII_API_KEY not configured")
      // In development, fall back to console logging
      if (process.env.NODE_ENV === "development") {
        console.log(`[v0] [DEV MODE] Sending OTP to ${phone}: ${message}`)
        return true
      }
      throw new Error("SMS provider not configured")
    }

    // Ensure phone number is in international format (234...)
    const formattedPhone = phone.startsWith("+") ? phone.substring(1) : phone
    
    const payload = {
      to: formattedPhone,
      from: TERMII_SENDER_ID,
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: TERMII_API_KEY,
    }

    const response = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[v0] Termii API error:", result)
      throw new Error(result.message || "Failed to send SMS")
    }

    console.log("[v0] SMS sent successfully via Termii:", result)
    return true
  } catch (error) {
    console.error("[v0] SMS sending failed:", error)
    throw error
  }
}

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

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    const otpSession: OTPSession = {
      lgaId: uniqueLgaId,
      phone: lgaRecord.officialPhone,
      otp,
      expiresAt,
      createdAt: new Date(),
      attempts: 0,
    }

    await db.collection<OTPSession>("otp_sessions").insertOne(otpSession)

    // Once verified, uncomment the lines below to enable real SMS
    // const message = `Your Nigeria Security Survey OTP is: ${otp}. Valid for 10 minutes.`
    // await sendSMS(lgaRecord.officialPhone, message)
    
    console.log(`[v0] [TESTING MODE] OTP generated: ${otp} for phone: ${lgaRecord.officialPhone}`)

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      phone: lgaRecord.officialPhone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2"), // Masked phone
    })
  } catch (error) {
    console.error("[v0] Send OTP error:", error)
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    )
  }
}
