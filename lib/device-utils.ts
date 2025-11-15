export function generateDeviceFingerprint(req: Request): string {
  const headers = req.headers
  const userAgent = headers.get("user-agent") || ""
  const acceptLanguage = headers.get("accept-language") || ""
  const acceptEncoding = headers.get("accept-encoding") || ""
  
  // Combine multiple factors to create a device fingerprint
  const fingerprintString = `${userAgent}|${acceptLanguage}|${acceptEncoding}`
  
  // Create a simple hash
  let hash = 0
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  return `device_${Math.abs(hash).toString(36)}_${Date.now()}`
}

export function getClientIP(req: Request): string {
  const headers = req.headers
  return (
    headers.get("x-forwarded-for")?.split(",")[0] ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}
