import { createStart } from "@tanstack/react-start";
import { requestLoggingMiddleware } from "./middlewares/logging";

export const startInstance = createStart(() => {
  return {
    defaultSsr: false,
    requestMiddleware: [requestLoggingMiddleware],
  };
});
