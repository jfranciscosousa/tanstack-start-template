export interface RequestInfo {
  ipAddress: string;
  userAgent: string;
  location: string;
}

/**
 * Extract client IP address from request headers
 */
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  return request.headers.get("x-client-ip") || "unknown";
}

/**
 * Get location from CDN/edge platform headers
 */
function getLocationFromHeaders(request: Request): string | null {
  // Cloudflare
  const cfCountry = request.headers.get("cf-ipcountry");
  const cfCity = request.headers.get("cf-ipcity");

  if (cfCountry) {
    const city = cfCity ? decodeURIComponent(cfCity) : null;
    return city ? `${city}, ${cfCountry}` : cfCountry;
  }

  // Vercel
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const vercelCity = request.headers.get("x-vercel-ip-city");

  if (vercelCountry) {
    const city = vercelCity ? decodeURIComponent(vercelCity) : null;
    return city ? `${city}, ${vercelCountry}` : vercelCountry;
  }

  // AWS CloudFront
  const awsCountry = request.headers.get("cloudfront-viewer-country");
  if (awsCountry) return awsCountry;

  return null;
}

/**
 * Get location from IP using external service
 */
async function getLocationFromIP(ip: string): Promise<string | null> {
  if (
    ip === "unknown" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip === "127.0.0.1"
  ) {
    return null;
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();

    if (data.error) return null;

    const parts = [data.city, data.region, data.country_name].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

/**
 * Extract IP address, user agent, and location from a Request object
 */
export async function getRequestInfo(request: Request): Promise<RequestInfo> {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";

  // Try to get location from headers first (fast)
  let location = getLocationFromHeaders(request);

  // If no location from headers, try IP lookup
  if (!location) {
    location = await getLocationFromIP(ipAddress);
  }

  return {
    ipAddress,
    userAgent,
    location: location || "unknown",
  };
}
