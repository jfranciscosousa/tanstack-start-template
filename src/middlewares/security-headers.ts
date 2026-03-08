import { createMiddleware } from "@tanstack/react-start";

export function getSecurityHeaders(
  isProd = process.env.NODE_ENV === "production"
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
  };

  if (isProd) {
    headers["Strict-Transport-Security"] =
      "max-age=31536000; includeSubDomains";
  }

  return headers;
}

export const securityHeadersMiddleware = createMiddleware().server(
  async ({ next }) => {
    const result = await next();
    const headers = new Headers(result.response.headers);

    for (const [key, value] of Object.entries(getSecurityHeaders())) {
      headers.set(key, value);
    }

    return {
      ...result,
      response: new Response(result.response.body, {
        status: result.response.status,
        statusText: result.response.statusText,
        headers,
      }),
    };
  }
);
