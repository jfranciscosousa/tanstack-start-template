import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// eslint-disable-next-line import/no-namespace -- drizzle requires namespace import for schema
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/*
  Limit to 1 connection in tests so all queries share the same connection,
  enabling per-test transaction isolation via BEGIN/ROLLBACK.
*/
const client = postgres(process.env.DATABASE_URL, {
  ...(process.env.VITEST ? { max: 1 } : {}),
});

// Create the Drizzle instance
// @ts-expect-error drizzle types are funky during the rc
export const db = drizzle({
  client,
  schema,
  relations: schema.relations,
});
