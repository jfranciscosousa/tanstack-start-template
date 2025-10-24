import { createMiddleware } from "@tanstack/react-start";
import z from "zod";

function decodeBase64URI(str: string) {
  // Convert URI-safe Base64 to standard Base64
  let base64 = str
    .replace(/-/g, "+") // Replace - with +
    .replace(/_/g, "/"); // Replace _ with /

  // Add padding if needed (Base64 strings should be multiple of 4)
  while (base64.length % 4) {
    base64 += "=";
  }

  // Decode Base64
  const decoded = atob(base64);

  // Try to parse as JSON, otherwise return as string

  return z.object({ export: z.string() }).parse(JSON.parse(decoded));
}

function getRequestAsString(request: Request) {
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/_serverFn/")) {
    return `${request.method} ${url.pathname}`;
  }

  try {
    const decoded = decodeBase64URI(url.pathname.replace("/_serverFn/", ""));

    return `${request.method} ${decoded.export}`;
  } catch (error) {
    console.error(error);
    console.error("Could not log malformed serverFnRequest");
  }
}

export const requestLoggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const requestAsString = getRequestAsString(request);

    try {
      const response = await next();

      console.log(
        "\x1b[33m%s\x1b[0m",
        "http",
        requestAsString,
        response.response.status
      );

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
