import { afterEach, beforeEach } from "vitest";
import { AsyncLocalStorage } from "node:async_hooks";
import { sql } from "drizzle-orm";

import { db } from "~/server/db";

/*
  Pre-initialize the AsyncLocalStorage that @tanstack/start-storage-context
  uses via a global Symbol key. Without this, getStartContext() throws
  "No Start context found" because createServerFn reads from this store
  even on the client middleware path (via getStartOptions).
*/
const STORAGE_KEY = Symbol.for("tanstack-start:start-storage-context");
const defaultContext = {
  // oxlint-disable-next-line typescript/no-explicit-any
  getRouter: () => ({}) as any,
  request: new Request("http://localhost:3000/"),
  startOptions: {},
  contextAfterGlobalMiddlewares: {},
  executedRequestMiddlewares: new Set<string>(),
  handlerType: "serverFn" as const,
};

// oxlint-disable-next-line typescript/no-explicit-any
(globalThis as any)[STORAGE_KEY] ??= new AsyncLocalStorage();

/*
  Wrap each test in a transaction that rolls back, so no data persists
  between tests. Requires the DB connection to use max: 1 (see db/index.ts).
  Also seeds the Start context into AsyncLocalStorage for createServerFn.
*/
beforeEach(async () => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const als = (globalThis as any)[STORAGE_KEY] as AsyncLocalStorage<any>;
  als.enterWith(defaultContext);

  await db.execute(sql`BEGIN`);
});

afterEach(async () => {
  await db.execute(sql`ROLLBACK`);
});
