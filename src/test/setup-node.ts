import { beforeAll } from "vitest";
import { db } from "~/server/db";
import { sessions, users, todos } from "~/server/db/schema";

async function cleanup() {
  await db.delete(sessions);
  await db.delete(todos);
  await db.delete(users);
}

beforeAll(cleanup);
