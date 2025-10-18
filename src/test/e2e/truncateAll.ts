import { db } from "~/server/db";
import { sessions, users, todos } from "~/server/db/schema";

export async function truncateAll() {
  // Delete in proper order to respect foreign key constraints
  await db.delete(sessions);
  await db.delete(todos);
  await db.delete(users);
}
