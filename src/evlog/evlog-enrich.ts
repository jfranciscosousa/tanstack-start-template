import type { EnrichContext } from "evlog";

import { definePlugin } from "nitro";
import {
  createUserAgentEnricher,
  createRequestSizeEnricher,
} from "evlog/enrichers";
import { createAuthIdentifier } from "evlog/better-auth";
import { auditEnricher } from "evlog";

import { auth } from "~/lib/auth";
import { getServerFunctionName } from "~/evlog/server-function-log";

export default definePlugin(nitroApp => {
  const enrichers = [
    createUserAgentEnricher(),
    createRequestSizeEnricher(),
    auditEnricher(),
  ];
  const identifyUser = createAuthIdentifier(auth);

  nitroApp.hooks.hook("request", async event => {
    await identifyUser({
      path: new URL(event.req.url, "http://localhost").pathname,
      headers: Object.fromEntries(event.req.headers),
      context: event.req.context as {
        log?: Parameters<typeof identifyUser>[0]["context"]["log"];
      },
    });
  });

  function enrich(ctx: EnrichContext, path: string | undefined) {
    for (const enricher of enrichers) enricher(ctx);

    const serverFunction = getServerFunctionName(path ?? "");
    if (serverFunction) {
      ctx.event.serverFunction = serverFunction;
    }
  }

  nitroApp.hooks.hook("response", async (response, event) => {
    const log = event.req.context?.log as
      | { set: (fields: Record<string, unknown>) => void }
      | undefined;
    if (!log) {
      return;
    }

    const path = new URL(event.req.url, "http://localhost").pathname;
    await identifyUser({
      path,
      headers: Object.fromEntries(event.req.headers),
      context: event.req.context as {
        log?: Parameters<typeof identifyUser>[0]["context"]["log"];
      },
    });

    const fields: Record<string, unknown> = {};
    enrich(
      {
        event: fields as EnrichContext["event"],
        headers: Object.fromEntries(event.req.headers),
        response: { headers: Object.fromEntries(response.headers) },
      },
      path
    );
    log.set(fields);
  });

  nitroApp.hooks.hook("evlog:enrich", ctx => {
    enrich(ctx, ctx.request?.path);
  });
});
