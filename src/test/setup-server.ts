import { afterEach, beforeEach } from "vitest";
import { sql } from "drizzle-orm";

import { db } from "~/server/db";

/*
  Wrap each test in a transaction that rolls back, so no data persists
  between tests. Requires the DB connection to use max: 1 (see db/index.ts).
*/
beforeEach(async () => {
  await db.execute(sql`BEGIN`);
});

afterEach(async () => {
  await db.execute(sql`ROLLBACK`);
});
