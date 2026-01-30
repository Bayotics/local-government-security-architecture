export const runtime = "nodejs"

const DEFAULT_UPSTREAM_URL =
  "https://res.cloudinary.com/dvrpa1lyo/video/upload/f_mp4,vc_h264,ac_aac,fl_progressive/v1769485915/lsat-how-it-works-nigerian-voice_1_gseg31.mp4"

function ensureCloudinaryH264Mp4(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== "res.cloudinary.com") return url
    if (!parsed.pathname.includes("/video/upload/")) return url

    // If the URL already requests mp4/h264, keep it.
    if (parsed.pathname.includes("/video/upload/f_mp4") || parsed.pathname.endsWith(".mp4")) return url

    // Insert a transformation to force broadly-supported codecs.
    // Example:
    // /video/upload/v123/foo.mov -> /video/upload/f_mp4,vc_h264,ac_aac,fl_progressive/v123/foo.mp4
    parsed.pathname = parsed.pathname.replace(
      "/video/upload/",
      "/video/upload/f_mp4,vc_h264,ac_aac,fl_progressive/",
    )

    parsed.pathname = parsed.pathname.replace(/\.(mov|m4v|mp4|webm)$/i, ".mp4")
    return parsed.toString()
  } catch {
    return url
  }
}

function guessContentType(upstream: Response, upstreamUrl: string) {
  const headerType = upstream.headers.get("content-type")
  if (headerType && headerType.toLowerCase().startsWith("video/")) return headerType

  const lower = upstreamUrl.toLowerCase()
  if (lower.endsWith(".webm")) return "video/webm"
  if (lower.endsWith(".mp4") || lower.endsWith(".m4v") || lower.endsWith(".mov")) return "video/mp4"
  return "video/mp4"
}

function getUpstreamUrl() {
  const raw = (
    process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_MP4_URL ||
    process.env.NEXT_PUBLIC_HOW_IT_WORKS_VIDEO_URL ||
    DEFAULT_UPSTREAM_URL
  )

  // Make Cloudinary sources reliably playable across Firefox/Edge/mobile.
  return ensureCloudinaryH264Mp4(raw)
}

function buildVideoResponseHeaders(upstream: Response, upstreamUrl: string, extra?: HeadersInit) {
  const headers = new Headers()

  // Preserve streaming-related headers when present.
  const passthrough = [
    "accept-ranges",
    "content-range",
    "content-length",
    "etag",
    "last-modified",
  ]

  for (const key of passthrough) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }

  // Force browser-friendly Content-Disposition; set a correct video Content-Type.
  // (GitHub Releases and some CDNs may respond as application/octet-stream.)
  headers.set("content-type", guessContentType(upstream, upstreamUrl))
  headers.set("content-disposition", "inline")

  // Reasonable caching (upstream URL is stable; GitHub redirects to short-lived signed URLs).
  headers.set("cache-control", "public, max-age=3600")

  if (extra) {
    const extraHeaders = new Headers(extra)
    extraHeaders.forEach((value, key) => headers.set(key, value))
  }

  return headers
}

export async function GET(request: Request) {
  const upstreamUrl = getUpstreamUrl()
  const range = request.headers.get("range")

  const upstream = await fetch(upstreamUrl, {
    redirect: "follow",
    headers: range ? { range } : undefined,
  })

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Failed to fetch video", { status: 502 })
  }

  const status = upstream.status === 206 ? 206 : 200
  const headers = buildVideoResponseHeaders(upstream, upstreamUrl)

  return new Response(upstream.body, { status, headers })
}

export async function HEAD() {
  const upstreamUrl = getUpstreamUrl()

  const upstream = await fetch(upstreamUrl, {
    method: "HEAD",
    redirect: "follow",
  })

  if (!upstream.ok) {
    return new Response(null, { status: 502 })
  }

  const headers = buildVideoResponseHeaders(upstream, upstreamUrl)
  return new Response(null, { status: 200, headers })
}
