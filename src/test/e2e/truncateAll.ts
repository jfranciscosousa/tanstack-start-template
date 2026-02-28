import { sessions, todos, users } from "~/server/db/schema";
import { db } from "~/server/db";

export async function truncateAll() {
  // Delete in proper order to respect foreign key constraints
  await db.delete(sessions);
  await db.delete(todos);
  await db.delete(users);
}
