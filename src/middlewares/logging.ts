import { createMiddleware } from "@tanstack/react-start";

export const requestLoggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const url = new URL(request.url);

    console.log(
      "\x1b[33m%s\x1b[0m",
      "http:request",
      request.method,
      url.pathname
    );

    try {
      const response = await next();

      console.log(
        "\x1b[33m%s\x1b[0m",
        "http:response",
        response.response.status
      );

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
