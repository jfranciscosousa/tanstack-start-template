import {
  accounts,
  sessions,
  todos,
  users,
  verifications,
} from "~/server/db/schema";
import { db } from "~/server/db";

export async function truncateAll() {
  // Delete in order respecting FK constraints
  await db.delete(verifications);
  await db.delete(sessions);
  await db.delete(todos);
  await db.delete(accounts);
  await db.delete(users);
}
