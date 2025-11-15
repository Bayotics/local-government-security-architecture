import { NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth-utils"

export async function GET() {
  const { isAdmin, username } = await verifyAdminSession()
  
  return NextResponse.json({
    isAdmin,
    username: isAdmin ? username : null,
  })
}
