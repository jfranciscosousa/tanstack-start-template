import { createStart } from "@tanstack/react-start";

import { requestLoggingMiddleware } from "./middlewares/logging";
import { securityHeadersMiddleware } from "./middlewares/security-headers";

export const startInstance = createStart(() => ({
  defaultSsr: false,
  requestMiddleware: [securityHeadersMiddleware, requestLoggingMiddleware],
}));
