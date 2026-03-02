import { beforeAll } from "vitest";

import { sessions, todos, users } from "~/server/db/schema";
import { db } from "~/server/db";

async function cleanup() {
  await db.delete(sessions);
  await db.delete(todos);
  await db.delete(users);
}

beforeAll(cleanup);
