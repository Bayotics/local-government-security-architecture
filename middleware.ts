import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect analysis routes
  if (pathname.startsWith("/analysis") || pathname.startsWith("/local-analysis")) {
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Verify session is valid (you could also check database here)
    try {
      const verifyResponse = await fetch(new URL("/api/admin/check-auth", request.url), {
        headers: {
          Cookie: `admin_session=${adminSession}`,
        },
      })

      const { isAdmin } = await verifyResponse.json()

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const adminSession = request.cookies.get("admin_session")?.value

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/analysis/:path*", "/local-analysis/:path*", "/admin/:path*"],
}
