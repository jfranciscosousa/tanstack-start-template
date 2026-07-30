import { evlogErrorHandler } from "evlog/nitro/v3";
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  defaultSsr: false,
  requestMiddleware: [
    csrfMiddleware,
    createMiddleware().server(evlogErrorHandler),
  ],
}));
